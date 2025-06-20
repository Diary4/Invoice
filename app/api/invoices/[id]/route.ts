import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = Number.parseInt(params.id)

    const [invoice] = await sql`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoiceId}
    `

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const items = await sql`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ${invoiceId}
      ORDER BY id ASC
    `

    return NextResponse.json({ ...invoice, items })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = Number.parseInt(params.id)
    const { status } = await request.json()

    const [invoice] = await sql`
      UPDATE invoices 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoiceId}
      RETURNING *
    `

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}
