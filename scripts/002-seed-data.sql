-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('Acme Corporation', 'billing@acme.com', '+1-555-0123', '123 Business St, New York, NY 10001'),
('Tech Solutions Ltd', 'accounts@techsolutions.com', '+1-555-0456', '456 Innovation Ave, San Francisco, CA 94105'),
('Global Imports LLC', 'finance@globalimports.com', '+964-770-123-4567', 'Baghdad Business District, Baghdad, Iraq');

-- Insert sample invoices
INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, currency, subtotal, tax_rate, tax_amount, total, status, notes) VALUES
('INV-2024-001', 1, '2024-01-15', '2024-02-14', 'USD', 1000.00, 10.00, 100.00, 1100.00, 'sent', 'Web development services'),
('INV-2024-002', 2, '2024-01-20', '2024-02-19', 'USD', 2500.00, 8.50, 212.50, 2712.50, 'paid', 'Software consulting'),
('INV-2024-003', 3, '2024-01-25', '2024-02-24', 'IQD', 1500000.00, 0.00, 0.00, 1500000.00, 'draft', 'Import services');

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
(1, 'Website Design', 1, 500.00, 500.00),
(1, 'Frontend Development', 20, 25.00, 500.00),
(2, 'Software Architecture Consultation', 10, 150.00, 1500.00),
(2, 'Code Review Services', 20, 50.00, 1000.00),
(3, 'Import Documentation Processing', 1, 750000.00, 750000.00),
(3, 'Customs Clearance Services', 1, 750000.00, 750000.00);
