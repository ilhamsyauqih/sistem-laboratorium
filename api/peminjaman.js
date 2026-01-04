import pool from './db.js';
import { allowCors, verifyToken } from './utils.js';

async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            let query = `
        SELECT p.*, u.nama as nama_peminjam, pt.nama_petugas
        FROM peminjaman p
        LEFT JOIN users u ON p.id_user = u.id_user
        LEFT JOIN petugas pt ON p.id_petugas = pt.id_petugas
      `;
            const params = [];

            if (user.role === 'borrower') {
                query += ' WHERE p.id_user = $1';
                params.push(user.id);
            }

            query += ' ORDER BY p.tanggal_pinjam DESC';

            const result = await pool.query(query, params);

            // Fetch details for each loan - this is N+1 but acceptable for small scale or we can use JSON_AGG
            // Using JSON_AGG is better.
            query = `
        SELECT p.*, u.nama as nama_peminjam, u.kontak as contact, pt.nama_petugas, pg.tanggal_kembali, pg.denda,
               (
                 SELECT json_agg(json_build_object(
                   'id_detail', d.id_detail,
                   'id_alat', d.id_alat,
                   'nama_alat', a.nama_alat,
                   'kode_alat', a.kode_alat,
                   'jumlah', d.jumlah,
                   'kondisi_awal', d.kondisi_awal
                 ))
                 FROM detail_peminjaman d
                 JOIN alat_laboratorium a ON d.id_alat = a.id_alat
                 WHERE d.id_peminjam = p.id_peminjam
               ) as details
        FROM peminjaman p
        LEFT JOIN users u ON p.id_user = u.id_user
        LEFT JOIN petugas pt ON p.id_petugas = pt.id_petugas
        LEFT JOIN pengembalian pg ON p.id_peminjam = pg.id_peminjam
      `;

            params.length = 0;
            if (user.role === 'borrower') {
                query += ' WHERE p.id_user = $1';
                params.push(user.id);
            }
            query += ' ORDER BY p.tanggal_pinjam DESC';

            const resultWithDetails = await pool.query(query, params);

            return res.status(200).json(resultWithDetails.rows);
        } catch (error) {
            console.error('Error fetching peminjaman:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        // Request borrow
        if (user.role !== 'borrower') {
            // Only borrowers start a request? Or admin can create on behalf?
            // Prompt: "Submit borrowing requests online" - Borrower feature.
            // Admin: "Verify, approve".
            // So User creates it.
            return res.status(403).json({ message: 'Only borrowers can request' });
        }

        const { items, durasi = 7 } = req.body;
        // [{ id_alat }] - amount is 1 for unique items usually? Table has 'jumlah'.
        // `alat_laboratorium` implies unique items if they have `kode_alat`. 
        // Usually unique items have detail quantity = 1.
        // However, table `detail_peminjaman` has `jumlah`.
        // If I borrow 2 Gelas Ukur, I need 2 distinct records or 1 record with quantity 2?
        // If equipment is tracked by `kode_alat` (unique), then they are individual rows in `alat`.
        // So if I borrow 2 Gelas Ukur, I must select 2 specific IDs.
        // So items = [id_alat1, id_alat2].

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items selected' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create peminjaman with custom loan period
            const peminjamanRes = await client.query(
                "INSERT INTO peminjaman (id_user, status_pinjam, tanggal_kembali_rencana) VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 || ' days')::interval) RETURNING id_peminjam",
                [user.id, 'Diajukan', durasi]
            );
            const idPeminjam = peminjamanRes.rows[0].id_peminjam;

            // Create details
            for (const item of items) {
                // Get alat info for condition
                const alatRes = await client.query('SELECT kondisi FROM alat_laboratorium WHERE id_alat = $1', [item.id_alat]);
                if (alatRes.rows.length === 0) throw new Error(`Alat ${item.id_alat} not found`);
                const kondisiAwal = alatRes.rows[0].kondisi;

                await client.query(
                    'INSERT INTO detail_peminjaman (id_peminjam, id_alat, jumlah, kondisi_awal) VALUES ($1, $2, $3, $4)',
                    [idPeminjam, item.id_alat, 1, kondisiAwal] // Assume 1 for unique items
                );
            }

            await client.query('COMMIT');
            return res.status(201).json({ message: 'Request submitted', id_peminjam: idPeminjam });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating peminjaman:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            client.release();
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default allowCors(handler);
