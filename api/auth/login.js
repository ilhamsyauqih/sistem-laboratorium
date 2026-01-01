import pool from '../db.js';
import bcrypt from 'bcryptjs';
import { allowCors, signToken } from '../utils.js';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { role, username, password, nama } = req.body;

    try {
        if (role === 'admin') {
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password required' });
            }

            const result = await pool.query('SELECT * FROM petugas WHERE username = $1', [username]);
            const admin = result.rows[0];

            if (!admin) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const validPassword = await bcrypt.compare(password, admin.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = signToken({ id: admin.id_petugas, role: 'admin', name: admin.nama_petugas });
            return res.status(200).json({ token, user: { id: admin.id_petugas, name: admin.nama_petugas, role: 'admin' } });

        } else if (role === 'borrower') {
            // Login by name for simplicity as per requirements (or exact match)
            // In a real app we'd want a unique ID or registration number.
            // We will assume exact name match or ID if provided.

            if (!nama) {
                return res.status(400).json({ message: 'Nama required' });
            }

            const result = await pool.query('SELECT * FROM users WHERE nama = $1', [nama]);
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const token = signToken({ id: user.id_user, role: 'borrower', name: user.nama });
            return res.status(200).json({ token, user: { id: user.id_user, name: user.nama, role: 'borrower', kelas: user.kelas } });

        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

    } catch (error) {
        console.error('Login error details:', error);
        return res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
}

export default allowCors(handler);
