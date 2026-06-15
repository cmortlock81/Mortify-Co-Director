import { query } from '../db/pool.js';
export async function getDashboard() {
 const [revenue, invoices, projects, health, briefing] = await Promise.all([
  query("SELECT COALESCE(SUM(amount),0) revenue FROM invoices WHERE status='paid'"),
  query("SELECT invoice_number, amount, due_date, status FROM invoices WHERE status IN ('sent','overdue') ORDER BY due_date ASC LIMIT 10"),
  query("SELECT name,status,priority,progress,due_date FROM projects WHERE status='active' ORDER BY priority ASC,due_date ASC LIMIT 10"),
  query("SELECT check_type,target,status,details,checked_at FROM monitoring_checks ORDER BY checked_at DESC LIMIT 10"),
  query("SELECT content,created_at FROM reports WHERE kind='daily_briefing' ORDER BY created_at DESC LIMIT 1")]);
 return { revenue: Number(revenue.rows[0].revenue), outstandingInvoices: invoices.rows, activeProjects: projects.rows, serverHealth: health.rows, dailyBriefing: briefing.rows[0]?.content ?? null };
}
