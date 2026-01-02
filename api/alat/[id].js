export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

import pool from '../db.js';
import { allowCors, verifyToken } from '../utils.js';
import cloudinary from '../lib/cloudinary.js';

async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const user = verifyToken(token);

    const { id } = req.query; // file system routing provides this

    if (req.method === 'GET') {
        // Get single equipment - for testing routing
        try {
            const result = await pool.query('SELECT * FROM alat_laboratorium WHERE id_alat = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Alat not found' });
            }
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching alat:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'PUT') {
        // Admin only for updates
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { nama_alat, kode_alat, kondisi, status, lokasi, gambar_url } = req.body;

        try {
            let finalImageUrl = gambar_url;

            // If it's a new base64 image, upload to Cloudinary
            if (gambar_url && gambar_url.startsWith('data:image')) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(gambar_url, {
                        folder: 'sistem-laboratorium/alat',
                    });
                    finalImageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({ message: 'Failed to upload image' });
                }
            }

            const result = await pool.query(
                'UPDATE alat_laboratorium SET nama_alat = $1, kode_alat = $2, kondisi = $3, status = $4, lokasi = $5, gambar_url = $6 WHERE id_alat = $7 RETURNING *',
                [nama_alat, kode_alat, kondisi, status, lokasi, finalImageUrl || null, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Alat not found' });
            }

            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error updating alat:', error);
            return res.status(500).json({ message: error.message || 'Internal Server Error' });
        }
    } else if (req.method === 'DELETE') {
        // Admin only for deletes
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        try {
            const result = await pool.query('DELETE FROM alat_laboratorium WHERE id_alat = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Alat not found' });
            }
            return res.status(200).json({ message: 'Alat deleted' });
        } catch (error) {
            console.error('Error deleting alat:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

export default allowCors(handler);
