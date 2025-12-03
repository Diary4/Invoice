-- Add amount_language column to payment_vouchers table
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';
