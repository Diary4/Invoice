import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const vouchers = await sql`
      SELECT 
        rv.*,
        c.name as customer_name,
        c.email as customer_email
      FROM receipt_vouchers rv
      LEFT JOIN customers c ON rv.customer_id = c.id
      ORDER BY rv.created_at DESC
    `

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error("Error fetching receipt vouchers:", error)
    return NextResponse.json({ error: "Failed to fetch receipt vouchers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const voucherData = await request.json()
    const {
      voucher_number,
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
      INSERT INTO receipt_vouchers (
        voucher_number, customer_id, receipt_date, currency,
        amount, payment_method, reference_number, description, status, notes
      )
      VALUES (
        ${voucher_number}, ${customer_id}, ${receipt_date}, ${currency},
        ${amount}, ${payment_method}, ${reference_number}, ${description}, ${status}, ${notes}
      )
      RETURNING *
    `

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error creating receipt voucher:", error)
    return NextResponse.json({ error: "Failed to create receipt voucher" }, { status: 500 })
  }
}

