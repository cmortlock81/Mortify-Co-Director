import { query } from '../db/pool.js';

export async function getDashboard() {
 const [pipeline, won, projects, tickets, invoices, margin, briefing] = await Promise.all([
  query("SELECT COALESCE(SUM(deal_value_minor),0) value FROM opportunities WHERE stage NOT IN ('won','lost')"),
  query("SELECT COALESCE(SUM(deal_value_minor),0) value FROM opportunities WHERE stage='won'"),
  query("SELECT id,name,status,priority,progress,due_date,budget_minor,estimated_cost_minor,actual_cost_minor FROM projects WHERE status IN ('planned','active','on_hold') ORDER BY priority ASC,due_date ASC LIMIT 10"),
  query("SELECT id,subject,priority,status,sla_due_at FROM tickets WHERE status NOT IN ('resolved','closed') AND sla_due_at < now() ORDER BY sla_due_at ASC LIMIT 10"),
  query("SELECT i.id,i.invoice_number,i.status,i.total_minor,i.due_date,COALESCE(SUM(p.amount_minor),0) paid_minor,(i.total_minor-COALESCE(SUM(p.amount_minor),0)) outstanding_minor FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE i.status IN ('sent','part_paid','overdue') GROUP BY i.id ORDER BY i.due_date ASC LIMIT 10"),
  query("SELECT p.id,p.name,p.budget_minor,p.actual_cost_minor,(p.budget_minor-p.actual_cost_minor) margin_minor FROM projects p ORDER BY p.created_at DESC LIMIT 10"),
  query("SELECT content,created_at FROM reports WHERE kind='daily_briefing' ORDER BY created_at DESC LIMIT 1")]);
 return { pipelineValueMinor: Number(pipeline.rows[0].value), wonRevenueMinor: Number(won.rows[0].value), openProjects: projects.rows, overdueTickets: tickets.rows, outstandingInvoices: invoices.rows, projectMargins: margin.rows, dailyBriefing: briefing.rows[0]?.content ?? null };
}
