-- Update invoice table to set default currency to IQD
ALTER TABLE invoices 
ALTER COLUMN currency SET DEFAULT 'IQD';

-- Note: tax_rate and tax_amount columns are kept for backward compatibility
-- but will always be set to 0 in new invoices


