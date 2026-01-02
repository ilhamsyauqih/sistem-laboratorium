import pool from '../db.js';
import { allowCors, verifyToken } from '../utils.js';

async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.query;

    if (req.method === 'PUT') {
        const { action, kondisi_kembali, catatan_pengembalian } = req.body;
        // action: 'approve', 'reject', 'return'

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (action === 'approve') {
                // Update peminjaman status
                await client.query(
                    'UPDATE peminjaman SET status_pinjam = $1, id_petugas = $2 WHERE id_peminjam = $3',
                    ['Dipinjam', user.id, id]
                );

                // Update alat status to 'Dipinjam'
                // Get all alat associated with this loan
                const details = await client.query('SELECT id_alat FROM detail_peminjaman WHERE id_peminjam = $1', [id]);
                for (const row of details.rows) {
                    await client.query('UPDATE alat_laboratorium SET status = $1 WHERE id_alat = $2', ['Dipinjam', row.id_alat]);
                }

            } else if (action === 'reject') {
                await client.query(
                    'UPDATE peminjaman SET status_pinjam = $1, id_petugas = $2 WHERE id_peminjam = $3',
                    ['Ditolak', user.id, id]
                );

            } else if (action === 'return') {
                // Calculate denda based on delay (Rp 5,000 per day)
                // We'll use a subquery to get tanggal_kembali_rencana and calculate difference
                await client.query(
                    `INSERT INTO pengembalian (id_peminjam, kondisi_kembali, catatan_pengembalian, denda)
                     SELECT $1, $2, $3, 
                            CASE 
                                WHEN CURRENT_TIMESTAMP > p.tanggal_kembali_rencana THEN 
                                     CEIL(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.tanggal_kembali_rencana)) / 86400) * 5000
                                ELSE 0 
                            END
                     FROM peminjaman p WHERE p.id_peminjam = $1`,
                    [id, kondisi_kembali || 'Baik', catatan_pengembalian]
                );

                // Update peminjaman status
                await client.query(
                    'UPDATE peminjaman SET status_pinjam = $1 WHERE id_peminjam = $2',
                    ['Selesai', id]
                );

                // Update alat status back to 'Tersedia' (or whatever condition is)
                // If condition is 'Rusak', set status 'Rusak'
                const finalStatus = (kondisi_kembali && kondisi_kembali !== 'Baik') ? 'Rusak' : 'Tersedia';
                const finalKondisi = kondisi_kembali || 'Baik';

                const details = await client.query('SELECT id_alat FROM detail_peminjaman WHERE id_peminjam = $1', [id]);
                for (const row of details.rows) {
                    await client.query('UPDATE alat_laboratorium SET status = $1, kondisi = $2 WHERE id_alat = $3', [finalStatus, finalKondisi, row.id_alat]);
                }
            } else {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Invalid action' });
            }

            await client.query('COMMIT');
            return res.status(200).json({ message: 'Success' });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating peminjaman:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            client.release();
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default allowCors(handler);
