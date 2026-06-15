import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
const dryRun = process.argv.includes('--dry-run');
const sql = await readFile(new URL('../../../sql/schema.sql', import.meta.url), 'utf8');
if (dryRun) { console.log('Schema loaded'); process.exit(0); }
await pool.query(sql); await pool.end(); console.log('Migrations complete');
