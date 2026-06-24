-- Run this on production if voucher create/update fails due to missing columns.

ALTER TABLE payment_vouchers
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS accountant_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS descriptions JSONB,
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';

ALTER TABLE receipt_vouchers
ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS descriptions JSONB,
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english';

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS branch VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount_language VARCHAR(20) DEFAULT 'english',
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE payment_vouchers
ALTER COLUMN currency SET DEFAULT 'IQD';

ALTER TABLE receipt_vouchers
ALTER COLUMN currency SET DEFAULT 'IQD';
