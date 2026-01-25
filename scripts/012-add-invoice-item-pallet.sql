-- Add pallet column to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS pallet INTEGER DEFAULT 0;
