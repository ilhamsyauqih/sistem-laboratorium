import pool from './api/db.js';

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // Add compliance_score to users
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_score INTEGER DEFAULT 80');
        console.log('Added compliance_score to users table.');

        // Create compliance_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS compliance_logs (
                id_log SERIAL PRIMARY KEY,
                id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
                id_peminjam INTEGER REFERENCES peminjaman(id_peminjam) ON DELETE SET NULL,
                point_change INTEGER NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created compliance_logs table.');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

migrate();
