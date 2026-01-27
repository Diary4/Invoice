-- Add paid_amount column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Update status to include partially_paid
-- Note: This is just a comment, the status column already supports VARCHAR(20)
-- You may want to add a CHECK constraint, but we'll handle it in the application logic
