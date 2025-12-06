-- Add amount_language column to receipt_vouchers table
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';
