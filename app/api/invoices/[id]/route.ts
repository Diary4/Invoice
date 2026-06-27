import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { resolveCustomerId } from "@/lib/resolve-customer"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const invoiceId = Number.parseInt(id, 10)

    if (Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    }

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

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const invoiceId = Number.parseInt(id, 10)

    if (Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    }

    const invoiceData = await request.json()
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
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

    const resolvedCustomerId = await resolveCustomerId({
      customer_id: customer_id ?? null,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
    })

    let invoice
    try {
      const result = await sql`
        UPDATE invoices
        SET
          customer_id = ${resolvedCustomerId},
          issue_date = ${issue_date},
          due_date = ${due_date},
          currency = ${currency},
          subtotal = ${subtotal},
          total = ${total},
          paid_amount = ${paid_amount || 0},
          status = ${status},
          notes = ${notes || null},
          branch = ${branch || null},
          amount_language = ${amount_language || "english"},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${invoiceId}
        RETURNING *
      `
      invoice = result[0]
    } catch (firstError) {
      const firstErrorString = String(firstError).toLowerCase()
      if (
        firstErrorString.includes("column") &&
        (firstErrorString.includes("amount_language") || firstErrorString.includes("branch"))
      ) {
        try {
          const result = await sql`
            UPDATE invoices
            SET
              customer_id = ${resolvedCustomerId},
              issue_date = ${issue_date},
              due_date = ${due_date},
              currency = ${currency},
              subtotal = ${subtotal},
              total = ${total},
              paid_amount = ${paid_amount || 0},
              status = ${status},
              notes = ${notes || null},
              amount_language = ${amount_language || "english"},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${invoiceId}
            RETURNING *
          `
          invoice = result[0]
        } catch (secondError) {
          const secondErrorString = String(secondError).toLowerCase()
          if (secondErrorString.includes("column") && secondErrorString.includes("amount_language")) {
            const result = await sql`
              UPDATE invoices
              SET
                customer_id = ${resolvedCustomerId},
                issue_date = ${issue_date},
                due_date = ${due_date},
                currency = ${currency},
                subtotal = ${subtotal},
                total = ${total},
                paid_amount = ${paid_amount || 0},
                status = ${status},
                notes = ${notes || null},
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ${invoiceId}
              RETURNING *
            `
            invoice = result[0]
          } else {
            throw secondError
          }
        }
      } else {
        throw firstError
      }
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM invoice_items
      WHERE invoice_id = ${invoiceId}
    `

    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, pallet)
          VALUES (
            ${invoiceId},
            ${item.description},
            ${item.quantity},
            ${item.unit_price},
            ${item.total},
            ${item.pallet || 0}
          )
        `
      }
    }

    const [invoiceWithCustomer] = await sql`
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

    const updatedItems = await sql`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${invoiceId}
      ORDER BY id ASC
    `

    return NextResponse.json({ ...invoiceWithCustomer, items: updatedItems })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const invoiceId = Number.parseInt(id, 10)

    if (Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    }

    // Delete invoice items first (foreign key constraint)
    await sql`
      DELETE FROM invoice_items
      WHERE invoice_id = ${invoiceId}
    `

    // Then delete the invoice
    await sql`
      DELETE FROM invoices
      WHERE id = ${invoiceId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
