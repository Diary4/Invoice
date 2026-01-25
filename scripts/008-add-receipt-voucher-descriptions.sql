-- Add descriptions column to receipt_vouchers table (store as JSON array)
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS descriptions JSONB;









