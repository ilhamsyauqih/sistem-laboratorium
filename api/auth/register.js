import pool from '../db.js';
import { allowCors, signToken } from '../utils.js';


async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { nama, jenis, kelas, kontak } = req.body;

    if (!nama || !jenis) {
        return res.status(400).json({ message: 'Nama dan Jenis harus diisi' });
    }

    try {
        // Check if already exists
        const check = await pool.query('SELECT * FROM users WHERE nama = $1', [nama]);
        if (check.rows.length > 0) {
            return res.status(409).json({ message: 'Nama pengguna sudah terdaftar' });
        }

        const result = await pool.query(
            'INSERT INTO users (nama, jenis, kelas, kontak) VALUES ($1, $2, $3, $4) RETURNING id_user, nama, jenis',
            [nama, jenis, kelas || null, kontak || null] // Use null for empty strings
        );

        const newUser = result.rows[0];
        const token = signToken({ id: newUser.id_user, role: 'borrower', name: newUser.nama });

        return res.status(201).json({
            message: 'Registrasi berhasil',
            token,
            user: {
                id: newUser.id_user,
                name: newUser.nama,
                role: 'borrower',
                kelas: newUser.kelas
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
}

export default allowCors(handler);
