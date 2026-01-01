import pool from './db.js';
import { allowCors, verifyToken } from './utils.js';

async function handler(req, res) {
    // Check Auth
    const token = req.headers.authorization?.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        // List all equipment
        try {
            const { status, search } = req.query;
            let query = 'SELECT * FROM alat_laboratorium';
            const params = [];
            const conditions = [];

            if (status) {
                conditions.push(`status = $${params.length + 1}`);
                params.push(status);
            }

            if (search) {
                conditions.push(`(nama_alat ILIKE $${params.length + 1} OR kode_alat ILIKE $${params.length + 1})`);
                params.push(`%${search}%`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY nama_alat ASC';

            const result = await pool.query(query, params);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching alat:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        // Create new equipment (Admin only)
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { nama_alat, kode_alat, kondisi, status, lokasi, gambar_url } = req.body;

        if (!nama_alat || !kode_alat || !kondisi || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // Check duplicate code
            const check = await pool.query('SELECT id_alat FROM alat_laboratorium WHERE kode_alat = $1', [kode_alat]);
            if (check.rows.length > 0) {
                return res.status(409).json({ message: 'Kode alat already exists' });
            }

            const result = await pool.query(
                'INSERT INTO alat_laboratorium (nama_alat, kode_alat, kondisi, status, lokasi, gambar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [nama_alat, kode_alat, kondisi, status, lokasi, gambar_url || null]
            );
            return res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating alat:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default allowCors(handler);
