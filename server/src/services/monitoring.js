import tls from 'node:tls';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { query } from '../db/pool.js';
const exec = promisify(execFile);
export async function checkWebsite(url) { const started = Date.now(); try { const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); return save('uptime', url, response.ok ? 'ok' : 'degraded', { statusCode: response.status, latencyMs: Date.now() - started }); } catch (error) { return save('uptime', url, 'critical', { error: error.message }); } }
export async function checkSsl(hostname) { return new Promise(resolve => { const socket = tls.connect(443, hostname, { servername: hostname }, () => { const cert = socket.getPeerCertificate(); socket.end(); resolve(save('ssl', hostname, 'ok', { validTo: cert.valid_to })); }); socket.on('error', error => resolve(save('ssl', hostname, 'critical', { error: error.message }))); }); }
export async function checkDisk() { try { const { stdout } = await exec('df', ['-h', '/']); return save('disk', '/', 'ok', { output: stdout }); } catch (error) { return save('disk', '/', 'critical', { error: error.message }); } }
export async function checkDocker() { try { const { stdout } = await exec('docker', ['ps', '--format', '{{json .}}']); return save('docker', 'local', 'ok', { containers: stdout.trim().split('\n').filter(Boolean) }); } catch (error) { return save('docker', 'local', 'degraded', { error: error.message }); } }
async function save(checkType, target, status, details) { const { rows } = await query('INSERT INTO monitoring_checks (check_type,target,status,details) VALUES ($1,$2,$3,$4) RETURNING *', [checkType, target, status, details]); return rows[0]; }
