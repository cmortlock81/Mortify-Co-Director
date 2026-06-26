INSERT INTO companies (name,domain,industry,phone,address,status) VALUES
('Northstar Manufacturing','northstar.example','Manufacturing','+44 20 0100 1000','1 Boardroom Sq, London','customer'),
('Apex Legal Group','apexlegal.example','Professional Services','+44 20 0100 2000','22 Counsel St, Manchester','prospect'),
('Harbour Retail','harbour.example','Retail','+44 20 0100 3000','8 Quay Rd, Bristol','customer')
ON CONFLICT DO NOTHING;
INSERT INTO contacts (company_id,first_name,last_name,email,phone,title)
SELECT id,'Amelia','Stone','amelia@northstar.example','+44 7700 900001','Operations Director' FROM companies WHERE name='Northstar Manufacturing'
UNION ALL SELECT id,'Jon','Reed','jon@apexlegal.example','+44 7700 900002','Managing Partner' FROM companies WHERE name='Apex Legal Group'
UNION ALL SELECT id,'Priya','Shah','priya@harbour.example','+44 7700 900003','Finance Manager' FROM companies WHERE name='Harbour Retail';
INSERT INTO clients (company_id,name,email,status) SELECT id,name, 'billing@'||domain,'active' FROM companies WHERE status='customer' ON CONFLICT DO NOTHING;
INSERT INTO leads (company_id,source,status,estimated_value_minor,notes) SELECT id,'Referral','qualified',4500000,'Board reporting automation interest' FROM companies WHERE name='Apex Legal Group';
INSERT INTO opportunities (company_id,name,stage,deal_value_minor,probability,expected_close_date) SELECT id,'ERP support retainer','proposal',7200000,65,current_date + 21 FROM companies WHERE name='Apex Legal Group' UNION ALL SELECT id,'Factory workflow rollout','won',12500000,100,current_date - 10 FROM companies WHERE name='Northstar Manufacturing';
INSERT INTO quotes (opportunity_id,quote_number,status,subtotal_minor,tax_minor,total_minor,valid_until) SELECT id,'Q-1001','sent',6000000,1200000,7200000,current_date + 14 FROM opportunities WHERE name='ERP support retainer' UNION ALL SELECT id,'Q-1002','accepted',10416667,2083333,12500000,current_date + 30 FROM opportunities WHERE name='Factory workflow rollout';
INSERT INTO quote_lines (quote_id,description,quantity,unit_price_minor,tax_rate) SELECT id,'Implementation and support package',1,6000000,20 FROM quotes WHERE quote_number='Q-1001' UNION ALL SELECT id,'Workflow rollout fixed fee',1,10416667,20 FROM quotes WHERE quote_number='Q-1002';
INSERT INTO projects (company_id,opportunity_id,name,status,priority,budget_minor,estimated_cost_minor,actual_cost_minor,progress,due_date) SELECT company_id,id,'Northstar workflow rollout','active',1,12500000,7600000,4200000,48,current_date + 45 FROM opportunities WHERE name='Factory workflow rollout';
INSERT INTO tasks (project_id,title,status,assignee,due_date) SELECT id,'Map production approvals','in_progress','Maya PM',current_date + 7 FROM projects WHERE name='Northstar workflow rollout' UNION ALL SELECT id,'Configure executive dashboard','todo','Ari Analyst',current_date + 14 FROM projects WHERE name='Northstar workflow rollout';
INSERT INTO milestones (project_id,name,due_date) SELECT id,'Pilot go-live',current_date + 21 FROM projects WHERE name='Northstar workflow rollout';
INSERT INTO tickets (company_id,project_id,subject,priority,status,internal_notes,sla_due_at) SELECT company_id,id,'Dashboard export permissions','high','open','Check role matrix before changing defaults.',now() + interval '8 hours' FROM projects WHERE name='Northstar workflow rollout';
INSERT INTO invoices (company_id,project_id,invoice_number,status,subtotal_minor,tax_minor,total_minor,amount,due_date) SELECT company_id,id,'INV-2001','sent',3000000,600000,3600000,36000,current_date + 10 FROM projects WHERE name='Northstar workflow rollout' UNION ALL SELECT company_id,id,'INV-2000','paid',2000000,400000,2400000,24000,current_date - 15 FROM projects WHERE name='Northstar workflow rollout';
INSERT INTO invoice_lines (invoice_id,description,quantity,unit_price_minor,tax_rate) SELECT id,'Mobilisation milestone',1,3000000,20 FROM invoices WHERE invoice_number='INV-2001';
INSERT INTO payments (invoice_id,amount_minor,method,reference) SELECT id,2400000,'bank_transfer','PAY-SEED-001' FROM invoices WHERE invoice_number='INV-2000';
INSERT INTO activities (company_id,type,body) SELECT id,'note','Executive sponsor confirmed success metrics.' FROM companies WHERE name='Northstar Manufacturing';
INSERT INTO monitoring_checks (check_type,target,status,details) VALUES ('crm','mvp','ok','{"message":"Business CRM seed loaded"}') ON CONFLICT DO NOTHING;
