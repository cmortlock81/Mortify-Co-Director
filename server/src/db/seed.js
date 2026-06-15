import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
const email = process.env.ADMIN_EMAIL || 'admin@mortify.local';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
await pool.query(await readFile(new URL('../../../sql/sample-data.sql', import.meta.url), 'utf8'));
await pool.query('INSERT INTO users (email,password_hash,role) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING', [email, await bcrypt.hash(password, 12), 'admin']);
await pool.end(); console.log(`Seeded sample data and admin user ${email}`);
