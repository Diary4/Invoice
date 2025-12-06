-- Add name and accountant_name columns to payment_vouchers table
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS accountant_name VARCHAR(255);

-- Update default currency to IQD
ALTER TABLE payment_vouchers 
ALTER COLUMN currency SET DEFAULT 'IQD';





