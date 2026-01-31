import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const invoices = await sql`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const invoiceData = await request.json()
    console.log("Received invoice data:", invoiceData)
    
    const {
      invoice_number,
      customer_id,
      issue_date,
      due_date,
      currency,
      subtotal,
      total,
      paid_amount,
      status,
      notes,
      branch,
      items,
      amount_language,
    } = invoiceData

    // Validate required fields
    if (!invoice_number || !issue_date || !due_date || !currency || subtotal === undefined || total === undefined || !status) {
      return NextResponse.json(
        { error: "Missing required fields", received: invoiceData },
        { status: 400 }
      )
    }

    // Insert invoice
    let invoice
    try {
      // Try with amount_language first, fallback to without it if column doesn't exist
      let result
      try {
        result = await sql`
          INSERT INTO invoices (
            invoice_number, customer_id, issue_date, due_date, currency,
            subtotal, tax_rate, tax_amount, total, paid_amount, status, notes, branch, amount_language
          )
          VALUES (
            ${invoice_number}, ${customer_id || null}, ${issue_date}, ${due_date}, ${currency || 'IQD'},
            ${subtotal}, 0, 0, ${total}, ${paid_amount || 0}, ${status}, ${notes || null}, ${branch || null}, ${amount_language || 'english'}
          )
          RETURNING *
        `
      } catch (firstError) {
        const firstErrorString = String(firstError).toLowerCase()
        // If branch or amount_language column doesn't exist, try without it
        if (firstErrorString.includes("column") && (firstErrorString.includes("amount_language") || firstErrorString.includes("branch"))) {
          console.log("branch or amount_language column not found, inserting without it")
          try {
            result = await sql`
              INSERT INTO invoices (
                invoice_number, customer_id, issue_date, due_date, currency,
                subtotal, tax_rate, tax_amount, total, paid_amount, status, notes, amount_language
              )
              VALUES (
                ${invoice_number}, ${customer_id || null}, ${issue_date}, ${due_date}, ${currency || 'IQD'},
                ${subtotal}, 0, 0, ${total}, ${paid_amount || 0}, ${status}, ${notes || null}, ${amount_language || 'english'}
              )
              RETURNING *
            `
          } catch (secondError) {
            const secondErrorString = String(secondError).toLowerCase()
            if (secondErrorString.includes("column") && secondErrorString.includes("amount_language")) {
              result = await sql`
                INSERT INTO invoices (
                  invoice_number, customer_id, issue_date, due_date, currency,
                  subtotal, tax_rate, tax_amount, total, paid_amount, status, notes
                )
                VALUES (
                  ${invoice_number}, ${customer_id || null}, ${issue_date}, ${due_date}, ${currency || 'IQD'},
                  ${subtotal}, 0, 0, ${total}, ${paid_amount || 0}, ${status}, ${notes || null}
                )
                RETURNING *
              `
            } else {
              throw secondError
            }
          }
        } else {
          throw firstError
        }
      }
      
      invoice = result[0]
      console.log("Invoice created:", invoice)
    } catch (dbError) {
      console.error("Database error creating invoice:", dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      
      // Extract more details from the error
      let errorDetails = String(dbError)
      if (dbError instanceof Error) {
        errorDetails = dbError.message
        if (dbError.stack) {
          console.error("Database error stack:", dbError.stack)
        }
      }
      
      // Check if it's a specific database error (like column doesn't exist, constraint violation, etc.)
      const errorString = String(dbError).toLowerCase()
      let userFriendlyMessage = errorMessage
      
      if (errorString.includes("column") && errorString.includes("does not exist")) {
        userFriendlyMessage = `Database column error: ${errorMessage}. Please run the migration script: scripts/011-add-invoice-amount-language.sql`
      } else if (errorString.includes("violates") || errorString.includes("constraint")) {
        userFriendlyMessage = `Database constraint error: ${errorMessage}. This might be due to invalid data or missing references.`
      } else if (errorString.includes("syntax error")) {
        userFriendlyMessage = `Database syntax error: ${errorMessage}`
      } else if (errorString.includes("duplicate key") || errorString.includes("unique")) {
        userFriendlyMessage = `Duplicate invoice number: ${invoice_number}. Please use a unique invoice number.`
      }
      
      return NextResponse.json(
        { 
          error: "Database error", 
          message: userFriendlyMessage, 
          details: errorDetails,
          originalError: errorMessage
        },
        { status: 500 }
      )
    }

    // Insert invoice items
    if (items && items.length > 0) {
      try {
        for (const item of items) {
          await sql`
            INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, pallet)
            VALUES (${invoice.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.total}, ${item.pallet || 0})
          `
        }
        console.log(`Inserted ${items.length} invoice items`)
      } catch (itemsError) {
        console.error("Error inserting invoice items:", itemsError)
        // Don't fail the whole request if items fail - invoice is already created
        // But log the error
        const errorMessage = itemsError instanceof Error ? itemsError.message : String(itemsError)
        return NextResponse.json(
          { 
            error: "Invoice created but items failed", 
            invoice,
            itemsError: errorMessage 
          },
          { status: 207 } // 207 Multi-Status
        )
      }
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create invoice"
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
