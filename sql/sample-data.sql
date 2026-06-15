INSERT INTO companies (name, domain, industry) VALUES ('Mortify Digital','mortify.example','Digital Operations') ON CONFLICT DO NOTHING;
INSERT INTO clients (company_id, name, email) SELECT id,'Acme Retail','ops@acme.example' FROM companies LIMIT 1;
INSERT INTO projects (client_id, name, status, priority, budget, progress, due_date) SELECT id,'WordPress commerce rebuild','active',1,18000,62,CURRENT_DATE + 21 FROM clients LIMIT 1;
INSERT INTO tasks (project_id, title, status, assignee, due_date) SELECT id,'Ship checkout QA fixes','in_progress','Delivery Lead',CURRENT_DATE + 2 FROM projects LIMIT 1;
INSERT INTO invoices (client_id, invoice_number, amount, status, due_date) SELECT id,'INV-1001',4200,'sent',CURRENT_DATE - 5 FROM clients LIMIT 1;
INSERT INTO ai_memory (memory_type, subject, content) VALUES ('business_context','Operating principle','Prioritise cash collection, client retention, and server reliability.');
