-- Remove year from existing invoice numbers
-- Changes format from INV-YYYYMMDD-XXXXXX to INV-MMDD-XXXXXX
-- Example: INV-20260211-123456 becomes INV-0211-123456

UPDATE invoices
SET invoice_number = 
  CASE 
    -- Pattern: INV-YYYYMMDD-XXXXXX (8 digits after INV-)
    WHEN invoice_number ~ '^INV-[0-9]{8}-[0-9]+$' THEN
      'INV-' || 
      SUBSTRING(invoice_number FROM 8 FOR 2) ||  -- Month (positions 8-9)
      SUBSTRING(invoice_number FROM 10 FOR 2) ||  -- Day (positions 10-11)
      SUBSTRING(invoice_number FROM 12)           -- Rest (dash and timestamp)
    ELSE
      invoice_number  -- Keep unchanged if pattern doesn't match
  END
WHERE invoice_number ~ '^INV-[0-9]{8}-[0-9]+$';  -- Only update matching patterns

-- Verify the update (optional - you can run this to check results)
-- SELECT id, invoice_number FROM invoices ORDER BY id;
