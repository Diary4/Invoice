-- Add amount_language column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';

