import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProd ? {
        rejectUnauthorized: false
    } : false
});

if (!process.env.DATABASE_URL && isProd) {
    console.error('CRITICAL: DATABASE_URL is not set in production environment!');
}

export default pool;
