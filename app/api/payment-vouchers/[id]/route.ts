import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [voucher] = await sql`
      SELECT 
        pv.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM payment_vouchers pv
      LEFT JOIN customers c ON pv.customer_id = c.id
      WHERE pv.id = ${params.id}
    `

    if (!voucher) {
      return NextResponse.json({ error: "Payment voucher not found" }, { status: 404 })
    }

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error fetching payment voucher:", error)
    return NextResponse.json({ error: "Failed to fetch payment voucher" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const voucherData = await request.json()
    const {
      customer_id,
      payment_date,
      currency,
      amount,
      payment_method,
      reference_number,
      description,
      descriptions,
      status,
      notes,
      name,
      accountant_name,
    } = voucherData

    // Use descriptions array if provided, otherwise fall back to description string
    const descriptionsArray = descriptions && descriptions.length > 0 
      ? descriptions 
      : description 
        ? [description] 
        : null

    const [voucher] = await sql`
      UPDATE payment_vouchers
      SET 
        customer_id = ${customer_id || null},
        payment_date = ${payment_date},
        currency = ${currency},
        amount = ${amount},
        payment_method = ${payment_method},
        reference_number = ${reference_number},
        description = ${description},
        descriptions = ${descriptionsArray ? JSON.stringify(descriptionsArray) : null}::jsonb,
        status = ${status},
        notes = ${notes},
        name = ${name || null},
        accountant_name = ${accountant_name || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!voucher) {
      return NextResponse.json({ error: "Payment voucher not found" }, { status: 404 })
    }

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error updating payment voucher:", error)
    return NextResponse.json({ error: "Failed to update payment voucher" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`
      DELETE FROM payment_vouchers
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting payment voucher:", error)
    return NextResponse.json({ error: "Failed to delete payment voucher" }, { status: 500 })
  }
}

