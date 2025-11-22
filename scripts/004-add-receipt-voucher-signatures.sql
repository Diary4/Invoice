-- Add delivered_by and received_by columns to receipt_vouchers table
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

