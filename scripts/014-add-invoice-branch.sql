-- Add branch column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS branch VARCHAR(255);
