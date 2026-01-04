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
            const stats = {};

            if (user.role === 'admin') {
                const totalAlat = await pool.query('SELECT COUNT(*) FROM alat_laboratorium');
                const totalDipinjam = await pool.query("SELECT COUNT(*) FROM alat_laboratorium WHERE status = 'Dipinjam'");
                const totalRusak = await pool.query("SELECT COUNT(*) FROM alat_laboratorium WHERE kondisi = 'Rusak'");
                const activeLoans = await pool.query("SELECT COUNT(*) FROM peminjaman WHERE status_pinjam IN ('Dipinjam')");
                const pendingRequests = await pool.query("SELECT COUNT(*) FROM peminjaman WHERE status_pinjam = 'Diajukan'");

                stats.totalAlat = parseInt(totalAlat.rows[0].count);
                stats.totalDipinjam = parseInt(totalDipinjam.rows[0].count);
                stats.totalRusak = parseInt(totalRusak.rows[0].count);
                stats.activeLoans = parseInt(activeLoans.rows[0].count);
                stats.pendingRequests = parseInt(pendingRequests.rows[0].count);

                // Recent Activity
                const recent = await pool.query(`
          SELECT p.id_peminjam, u.nama, p.tanggal_pinjam, p.status_pinjam
          FROM peminjaman p
          JOIN users u ON p.id_user = u.id_user
          ORDER BY p.tanggal_pinjam DESC
          LIMIT 5
        `);
                stats.recentActivity = recent.rows;

            } else {
                // Borrower Stats
                const userRes = await pool.query('SELECT compliance_score FROM users WHERE id_user = $1', [user.id]);
                const myActive = await pool.query("SELECT COUNT(*) FROM peminjaman WHERE id_user = $1 AND status_pinjam = 'Dipinjam'", [user.id]);
                const myHistory = await pool.query("SELECT COUNT(*) FROM peminjaman WHERE id_user = $1", [user.id]);

                stats.compliance_score = userRes.rows[0].compliance_score;
                stats.activeLoans = parseInt(myActive.rows[0].count);
                stats.totalHistory = parseInt(myHistory.rows[0].count);
            }

            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default allowCors(handler);
