# Update Invoice Numbers - Remove Year

This script removes the year from existing invoice numbers in the database.

## What it does:
- Changes format from `INV-YYYYMMDD-XXXXXX` to `INV-MMDD-XXXXXX`
- Example: `INV-20260211-123456` becomes `INV-0211-123456`

## How to run:

### Option 1: Using the API endpoint (Recommended)
1. Make sure your development server is running: `npm run dev`
2. Open your browser or use curl/Postman to make a POST request to:
   ```
   http://localhost:3000/api/invoices/update-numbers
   ```
   
   Or using curl:
   ```bash
   curl -X POST http://localhost:3000/api/invoices/update-numbers
   ```

### Option 2: Using SQL script directly
1. Connect to your database
2. Run the SQL script:
   ```bash
   psql $DATABASE_URL -f scripts/015-remove-year-from-invoice-numbers.sql
   ```

## What happens:
- The script finds all invoices with the old format (8 digits after INV-)
- Updates them to the new format (4 digits: MM-DD)
- Skips any invoices where the new number would conflict with existing ones
- Returns a summary of what was updated

## Safety:
- Only updates invoices matching the pattern `INV-YYYYMMDD-XXXXXX`
- Checks for conflicts before updating
- Does not delete any data, only updates invoice numbers
