import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const vouchers = await sql`
      SELECT 
        pv.*,
        c.name as customer_name,
        c.email as customer_email
      FROM payment_vouchers pv
      LEFT JOIN customers c ON pv.customer_id = c.id
      ORDER BY pv.created_at DESC
    `

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error("Error fetching payment vouchers:", error)
    return NextResponse.json({ error: "Failed to fetch payment vouchers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const voucherData = await request.json()
    const {
      voucher_number,
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
      amount_language,
    } = voucherData

    // Use descriptions array if provided, otherwise fall back to description string
    const descriptionsArray = descriptions && descriptions.length > 0 
      ? descriptions 
      : description 
        ? [description] 
        : null

    const [voucher] = await sql`
      INSERT INTO payment_vouchers (
        voucher_number, customer_id, payment_date, currency,
        amount, payment_method, reference_number, description, descriptions, status, notes, name, accountant_name, amount_language
      )
      VALUES (
        ${voucher_number}, ${customer_id || null}, ${payment_date}, ${currency || 'IQD'},
        ${amount}, ${payment_method}, ${reference_number}, ${description}, ${descriptionsArray ? JSON.stringify(descriptionsArray) : null}::jsonb, ${status}, ${notes}, ${name || null}, ${accountant_name || null}, ${amount_language || 'english'}
      )
      RETURNING *
    `

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error creating payment voucher:", error)
    return NextResponse.json({ error: "Failed to create payment voucher" }, { status: 500 })
  }
}

