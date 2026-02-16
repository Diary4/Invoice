import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

/**
 * API endpoint to remove year from existing invoice numbers
 * Changes format from INV-YYYYMMDD-XXXXXX to INV-MMDD-XXXXXX
 * 
 * POST /api/invoices/update-numbers
 */
export async function POST(request: Request) {
  try {
    console.log('Starting invoice number update...')
    
    // Fetch all invoices with the old format (INV-YYYYMMDD-XXXXXX)
    const invoices = await sql`
      SELECT id, invoice_number 
      FROM invoices 
      WHERE invoice_number ~ '^INV-[0-9]{8}-[0-9]+$'
      ORDER BY id
    `
    
    console.log(`Found ${invoices.length} invoices to update`)
    
    if (invoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No invoices found with the old format. Nothing to update.",
        updated: 0,
        errors: 0
      })
    }
    
    const results = {
      updated: 0,
      errors: 0,
      skipped: 0,
      details: [] as Array<{ id: number; old: string; new: string; status: string }>
    }
    
    for (const invoice of invoices) {
      try {
        const oldNumber = invoice.invoice_number
        // Extract: INV-YYYYMMDD-XXXXXX
        // We want: INV-MMDD-XXXXXX
        const match = oldNumber.match(/^INV-(\d{4})(\d{2})(\d{2})-(.+)$/)
        
        if (!match) {
          results.details.push({
            id: invoice.id,
            old: oldNumber,
            new: '',
            status: 'error: could not parse'
          })
          results.errors++
          continue
        }
        
        const [, year, month, day, suffix] = match
        const newNumber = `INV-${month}${day}-${suffix}`
        
        // Check if new number already exists
        const existing = await sql`
          SELECT id FROM invoices WHERE invoice_number = ${newNumber}
        `
        
        if (existing.length > 0 && existing[0].id !== invoice.id) {
          results.details.push({
            id: invoice.id,
            old: oldNumber,
            new: newNumber,
            status: 'skipped: new number already exists'
          })
          results.skipped++
          continue
        }
        
        // Update the invoice number
        await sql`
          UPDATE invoices 
          SET invoice_number = ${newNumber}
          WHERE id = ${invoice.id}
        `
        
        results.details.push({
          id: invoice.id,
          old: oldNumber,
          new: newNumber,
          status: 'updated'
        })
        results.updated++
        
      } catch (error) {
        console.error(`Error updating invoice ${invoice.id}:`, error)
        results.details.push({
          id: invoice.id,
          old: invoice.invoice_number,
          new: '',
          status: `error: ${error instanceof Error ? error.message : String(error)}`
        })
        results.errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Update completed. Updated: ${results.updated}, Errors: ${results.errors}, Skipped: ${results.skipped}`,
      ...results
    })
    
  } catch (error) {
    console.error('Fatal error updating invoice numbers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update invoice numbers",
        details: String(error)
      },
      { status: 500 }
    )
  }
}
