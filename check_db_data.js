import pool from './api/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
    try {
        console.log("Checking database connection...");
        const res = await pool.query("SELECT count(*) FROM alat_laboratorium WHERE status = 'Tersedia'");
        console.log("Available tools count:", res.rows[0].count);

        const all = await pool.query("SELECT count(*) FROM alat_laboratorium");
        console.log("Total tools count:", all.rows[0].count);

        pool.end();
    } catch (e) {
        console.error("DB Error:", e);
    }
}

checkDb();
