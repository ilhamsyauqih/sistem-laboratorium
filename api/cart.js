import pool from './db.js';
import { allowCors, verifyToken } from './utils.js';

async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ensure table exists (simplified for this demo, usually done via migrations)
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS keranjang (
                id_keranjang SERIAL PRIMARY KEY,
                id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
                id_alat INTEGER REFERENCES alat_laboratorium(id_alat) ON DELETE CASCADE,
                jumlah INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(id_user, id_alat)
            )
        `);
    } catch (e) {
        console.error('Error ensuring table exists:', e);
    }

    if (req.method === 'GET') {
        try {
            const result = await pool.query(`
                SELECT k.*, a.nama_alat, a.kode_alat, a.lokasi, a.gambar_url, a.status, a.kondisi
                FROM keranjang k
                JOIN alat_laboratorium a ON k.id_alat = a.id_alat
                WHERE k.id_user = $1
                ORDER BY k.created_at ASC
            `, [user.id]);

            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching cart:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        const { items } = req.body; // Array of { id_alat, jumlah }

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Items must be an array' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Clear existing cart for this user
            await client.query('DELETE FROM keranjang WHERE id_user = $1', [user.id]);

            // Insert new items
            for (const item of items) {
                await client.query(
                    'INSERT INTO keranjang (id_user, id_alat, jumlah) VALUES ($1, $2, $3)',
                    [user.id, item.id_alat, item.jumlah || 1]
                );
            }

            await client.query('COMMIT');
            return res.status(200).json({ message: 'Cart synced successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error syncing cart:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            client.release();
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default allowCors(handler);
