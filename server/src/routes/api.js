import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { getDashboard } from '../services/dashboard.js';
import { generateDirectorReport, remember } from '../ai/director.js';
import { checkDisk, checkDocker, checkSsl, checkWebsite } from '../services/monitoring.js';
import { integrations } from '../integrations/index.js';
export const api = express.Router();

const resources = {
 companies: ['name','domain','industry','phone','address','status'], contacts: ['company_id','first_name','last_name','email','phone','title'], leads: ['company_id','contact_id','source','status','estimated_value_minor','notes'], opportunities: ['company_id','lead_id','name','stage','deal_value_minor','probability','expected_close_date'], quotes: ['opportunity_id','quote_number','status','subtotal_minor','tax_minor','total_minor','valid_until'], projects: ['company_id','opportunity_id','name','status','priority','budget_minor','estimated_cost_minor','actual_cost_minor','progress','due_date'], tasks: ['project_id','title','status','assignee','due_date'], milestones: ['project_id','name','due_date','completed_at'], tickets: ['company_id','project_id','assigned_user_id','subject','priority','status','internal_notes','sla_due_at'], invoices: ['company_id','project_id','invoice_number','status','subtotal_minor','tax_minor','total_minor','due_date'], payments: ['invoice_id','amount_minor','paid_at','method','reference'], activities: ['company_id','opportunity_id','project_id','ticket_id','invoice_id','type','body']
};
const orderBy = { companies:'name', contacts:'created_at DESC', leads:'created_at DESC', opportunities:'expected_close_date NULLS LAST', quotes:'created_at DESC', projects:'priority,due_date NULLS LAST', tasks:'due_date NULLS LAST', milestones:'due_date NULLS LAST', tickets:'sla_due_at NULLS LAST', invoices:'due_date NULLS LAST', payments:'paid_at DESC', activities:'created_at DESC' };
function assertResource(name){ if(!resources[name]) throw Object.assign(new Error('Unknown resource'),{ status:404 }); }
function cleanBody(resource, body){ return Object.fromEntries(resources[resource].filter(k => body[k] !== undefined && body[k] !== '').map(k => [k, body[k]])); }
async function listResource(resource, req){
 assertResource(resource); const search = req.query.search;
 let sql = `SELECT * FROM ${resource}`; const params=[];
 if(search && ['companies','opportunities','projects','tickets','invoices'].includes(resource)){ params.push(`%${search}%`); const field = resource === 'tickets' ? 'subject' : resource === 'invoices' ? 'invoice_number' : 'name'; sql += ` WHERE ${field} ILIKE $1`; }
 sql += ` ORDER BY ${orderBy[resource]} LIMIT 100`; return (await query(sql, params)).rows;
}
api.post('/auth/login', async (req,res)=>{ const { email, password } = req.body; const { rows } = await query('SELECT * FROM users WHERE email=$1',[email]); const user = rows[0]; if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error:'Invalid credentials' }); res.json({ token: signToken(user), user: { email:user.email, role:user.role } }); });
api.use(requireAuth);
api.get('/dashboard', async (_req,res,next)=>{ try{ res.json(await getDashboard()); }catch(e){ next(e); }});
api.get('/meta', async (_req,res,next)=>{ try { const [companies, opportunities, projects, invoices, users] = await Promise.all([query('SELECT id,name FROM companies ORDER BY name'), query('SELECT id,name FROM opportunities ORDER BY name'), query('SELECT id,name FROM projects ORDER BY name'), query('SELECT id,invoice_number name FROM invoices ORDER BY invoice_number'), query('SELECT id,email name FROM users ORDER BY email')]); res.json({ companies:companies.rows, opportunities:opportunities.rows, projects:projects.rows, invoices:invoices.rows, users:users.rows }); } catch(e){ next(e); }});
api.get('/resources/:resource', async (req,res,next)=>{ try{ res.json(await listResource(req.params.resource, req)); }catch(e){ next(e); }});
api.get('/resources/:resource/:id', async (req,res,next)=>{ try{ assertResource(req.params.resource); const { rows } = await query(`SELECT * FROM ${req.params.resource} WHERE id=$1`,[req.params.id]); if(!rows[0]) return res.status(404).json({error:'Not found'}); res.json(rows[0]); }catch(e){ next(e); }});
api.post('/resources/:resource', async (req,res,next)=>{ try{ const data=cleanBody(req.params.resource, req.body); const keys=Object.keys(data); if(!keys.length) return res.status(400).json({error:'No valid fields'}); const vals=Object.values(data); const cols=keys.join(','); const marks=keys.map((_,i)=>`$${i+1}`).join(','); const { rows } = await query(`INSERT INTO ${req.params.resource} (${cols}) VALUES (${marks}) RETURNING *`, vals); res.status(201).json(rows[0]); }catch(e){ next(e); }});
api.put('/resources/:resource/:id', async (req,res,next)=>{ try{ const data=cleanBody(req.params.resource, req.body); const keys=Object.keys(data); if(!keys.length) return res.status(400).json({error:'No valid fields'}); const vals=Object.values(data); vals.push(req.params.id); const set=keys.map((k,i)=>`${k}=$${i+1}`).join(','); const { rows } = await query(`UPDATE ${req.params.resource} SET ${set}, updated_at=now() WHERE id=$${vals.length} RETURNING *`, vals); res.json(rows[0]); }catch(e){ next(e); }});
api.delete('/resources/:resource/:id', async (req,res,next)=>{ try{ assertResource(req.params.resource); await query(`DELETE FROM ${req.params.resource} WHERE id=$1`,[req.params.id]); res.status(204).end(); }catch(e){ next(e); }});
api.post('/opportunities/:id/convert-to-project', async (req,res,next)=>{ try{ const { rows:[opp] } = await query("UPDATE opportunities SET stage='won', probability=100, updated_at=now() WHERE id=$1 RETURNING *",[req.params.id]); if(!opp) return res.status(404).json({error:'Opportunity not found'}); const existing = await query('SELECT * FROM projects WHERE opportunity_id=$1',[opp.id]); if(existing.rows[0]) return res.json(existing.rows[0]); const { rows } = await query("INSERT INTO projects (company_id,opportunity_id,name,status,budget_minor,estimated_cost_minor,due_date) VALUES ($1,$2,$3,'planned',$4,$5,$6) RETURNING *",[opp.company_id,opp.id,req.body.name || opp.name,opp.deal_value_minor,Math.round(opp.deal_value_minor*0.65),req.body.due_date || null]); res.status(201).json(rows[0]); }catch(e){ next(e); }});
api.get('/integrations', (_req,res)=>res.json(integrations));
api.post('/ai/report', async (req,res)=>res.status(201).json(await generateDirectorReport(req.body.kind || 'management_report')));
api.post('/ai/memory', async (req,res)=>res.status(201).json(await remember(req.body.memoryType, req.body.subject, req.body.content, req.body.metadata)));
api.get('/reports', async (_req,res)=>{ const { rows } = await query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50'); res.json(rows); });
api.post('/monitoring/run', async (req,res)=>{ const results = [await checkDisk(), await checkDocker()]; if (req.body.website) results.push(await checkWebsite(req.body.website)); if (req.body.sslHost) results.push(await checkSsl(req.body.sslHost)); res.status(201).json(results); });
api.use((err,_req,res,_next)=>res.status(err.status||500).json({ error: err.message || 'Server error' }));
