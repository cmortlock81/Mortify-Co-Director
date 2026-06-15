import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export function requireAuth(req, res, next) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Missing bearer token' }); try { req.user = jwt.verify(token, config.jwtSecret); next(); } catch { res.status(401).json({ error: 'Invalid token' }); } }
export const signToken = user => jwt.sign({ sub: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '8h' });
