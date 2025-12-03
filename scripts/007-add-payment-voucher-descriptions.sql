-- Add descriptions column to payment_vouchers table (store as JSON array)
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS descriptions JSONB;



