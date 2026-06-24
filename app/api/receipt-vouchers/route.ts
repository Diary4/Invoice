import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getNextReceiptVoucherNumber } from "@/lib/voucher-numbers"
import { resolveCustomerId } from "@/lib/resolve-customer"
import { insertReceiptVoucher } from "@/lib/receipt-voucher-db"

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
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      receipt_date,
      currency,
      amount,
      payment_method,
      reference_number,
      description,
      descriptions,
      status,
      notes,
      delivered_by,
      received_by,
      amount_language,
    } = voucherData

    const descriptionsArray =
      descriptions && descriptions.length > 0 ? descriptions : description ? [description] : null

    const voucher_number = await getNextReceiptVoucherNumber()
    const resolvedCustomerId = await resolveCustomerId({
      customer_id: customer_id || null,
      customer_name,
      customer_email,
      customer_phone,
    })

    const voucher = await insertReceiptVoucher({
      voucher_number,
      customer_id: resolvedCustomerId,
      receipt_date,
      currency,
      amount,
      payment_method,
      reference_number,
      description,
      descriptionsArray,
      status,
      notes,
      delivered_by: delivered_by || null,
      received_by: received_by || null,
      amount_language: amount_language || "english",
    })

    const [voucherWithCustomer] = await sql`
      SELECT 
        rv.*,
        c.name as customer_name,
        c.email as customer_email
      FROM receipt_vouchers rv
      LEFT JOIN customers c ON rv.customer_id = c.id
      WHERE rv.id = ${voucher.id}
    `

    return NextResponse.json(voucherWithCustomer)
  } catch (error) {
    console.error("Error creating receipt voucher:", error)
    const dbError = error as { code?: string; message?: string }
    if (dbError.code === "23505") {
      return NextResponse.json(
        { error: "A voucher with this number already exists. Please try again." },
        { status: 409 },
      )
    }
    return NextResponse.json(
      {
        error: "Failed to create receipt voucher",
        details: dbError.message || String(error),
      },
      { status: 500 },
    )
  }
}
