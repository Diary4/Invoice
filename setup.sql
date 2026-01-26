-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
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
-- Create payment_vouchers table
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create receipt_vouchers table
CREATE TABLE IF NOT EXISTS receipt_vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  receipt_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_customer_id ON payment_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_customer_id ON receipt_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_status ON receipt_vouchers(status);

-- Add delivered_by and received_by columns to receipt_vouchers table
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);










-- Add name and accountant_name columns to payment_vouchers table
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS accountant_name VARCHAR(255);

-- Update default currency to IQD
ALTER TABLE payment_vouchers 
ALTER COLUMN currency SET DEFAULT 'IQD';










-- Update invoice table to set default currency to IQD
ALTER TABLE invoices 
ALTER COLUMN currency SET DEFAULT 'IQD';

-- Note: tax_rate and tax_amount columns are kept for backward compatibility
-- but will always be set to 0 in new invoices










-- Add descriptions column to payment_vouchers table (store as JSON array)
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS descriptions JSONB;









-- Add descriptions column to receipt_vouchers table (store as JSON array)
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS descriptions JSONB;









-- Add amount_language column to payment_vouchers table
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';

-- Add amount_language column to receipt_vouchers table
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';
-- Add amount_language column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';

-- Add pallet column to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS pallet INTEGER DEFAULT 0;
