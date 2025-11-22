import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [voucher] = await sql`
      SELECT 
        rv.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM receipt_vouchers rv
      LEFT JOIN customers c ON rv.customer_id = c.id
      WHERE rv.id = ${params.id}
    `

    if (!voucher) {
      return NextResponse.json({ error: "Receipt voucher not found" }, { status: 404 })
    }

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error fetching receipt voucher:", error)
    return NextResponse.json({ error: "Failed to fetch receipt voucher" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const voucherData = await request.json()
    const {
      customer_id,
      receipt_date,
      currency,
      amount,
      payment_method,
      reference_number,
      description,
      status,
      notes,
    } = voucherData

    const [voucher] = await sql`
      UPDATE receipt_vouchers
      SET 
        customer_id = ${customer_id || null},
        receipt_date = ${receipt_date},
        currency = ${currency},
        amount = ${amount},
        payment_method = ${payment_method},
        reference_number = ${reference_number},
        description = ${description},
        status = ${status},
        notes = ${notes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!voucher) {
      return NextResponse.json({ error: "Receipt voucher not found" }, { status: 404 })
    }

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error updating receipt voucher:", error)
    return NextResponse.json({ error: "Failed to update receipt voucher" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`
      DELETE FROM receipt_vouchers
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting receipt voucher:", error)
    return NextResponse.json({ error: "Failed to delete receipt voucher" }, { status: 500 })
  }
}

