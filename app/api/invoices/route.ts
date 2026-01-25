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
    const {
      invoice_number,
      customer_id,
      issue_date,
      due_date,
      currency,
      subtotal,
      total,
      status,
      notes,
      items,
      amount_language,
    } = invoiceData

    // Insert invoice
    const [invoice] = await sql`
      INSERT INTO invoices (
        invoice_number, customer_id, issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, total, status, notes, amount_language
      )
      VALUES (
        ${invoice_number}, ${customer_id || null}, ${issue_date}, ${due_date}, ${currency || 'IQD'},
        ${subtotal}, 0, 0, ${total}, ${status}, ${notes}, ${amount_language || 'english'}
      )
      RETURNING *
    `

    // Insert invoice items
    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, pallet)
          VALUES (${invoice.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.total}, ${item.pallet || 0})
        `
      }
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
