import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getNextPaymentVoucherNumber } from "@/lib/voucher-numbers"
import { resolveCustomerId } from "@/lib/resolve-customer"

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
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
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

    const voucher_number = await getNextPaymentVoucherNumber()
    const resolvedCustomerId = await resolveCustomerId({
      customer_id: customer_id || null,
      customer_name,
      customer_email,
      customer_phone,
    })

    const [voucher] = await sql`
      INSERT INTO payment_vouchers (
        voucher_number, customer_id, payment_date, currency,
        amount, payment_method, reference_number, description, descriptions, status, notes, name, accountant_name, amount_language
      )
      VALUES (
        ${voucher_number}, ${resolvedCustomerId}, ${payment_date}, ${currency || 'IQD'},
        ${amount}, ${payment_method}, ${reference_number}, ${description}, ${descriptionsArray ? JSON.stringify(descriptionsArray) : null}::jsonb, ${status}, ${notes}, ${name || null}, ${accountant_name || null}, ${amount_language || 'english'}
      )
      RETURNING *
    `

    const [voucherWithCustomer] = await sql`
      SELECT 
        pv.*,
        c.name as customer_name,
        c.email as customer_email
      FROM payment_vouchers pv
      LEFT JOIN customers c ON pv.customer_id = c.id
      WHERE pv.id = ${voucher.id}
    `

    return NextResponse.json(voucherWithCustomer)
  } catch (error) {
    console.error("Error creating payment voucher:", error)
    const dbError = error as { code?: string; detail?: string }
    if (dbError.code === "23505") {
      return NextResponse.json(
        { error: "A voucher with this number already exists. Please try again." },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: "Failed to create payment voucher" }, { status: 500 })
  }
}

