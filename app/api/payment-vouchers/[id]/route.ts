import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { resolveCustomerId } from "@/lib/resolve-customer"
import { updatePaymentVoucherRecord } from "@/lib/payment-voucher-db"

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

    const descriptionsArray =
      descriptions && descriptions.length > 0 ? descriptions : description ? [description] : null

    const resolvedCustomerId = await resolveCustomerId({
      customer_id: customer_id || null,
      customer_name,
      customer_email,
      customer_phone,
    })

    const voucher = await updatePaymentVoucherRecord(params.id, {
      customer_id: resolvedCustomerId,
      payment_date,
      currency,
      amount,
      payment_method,
      reference_number,
      description,
      descriptionsArray,
      status,
      notes,
      name: name || null,
      accountant_name: accountant_name || null,
      amount_language: amount_language || "english",
    })

    if (!voucher) {
      return NextResponse.json({ error: "Payment voucher not found" }, { status: 404 })
    }

    const [voucherWithCustomer] = await sql`
      SELECT 
        pv.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM payment_vouchers pv
      LEFT JOIN customers c ON pv.customer_id = c.id
      WHERE pv.id = ${voucher.id}
    `

    return NextResponse.json(voucherWithCustomer)
  } catch (error) {
    console.error("Error updating payment voucher:", error)
    const dbError = error as { message?: string }
    return NextResponse.json(
      {
        error: "Failed to update payment voucher",
        details: dbError.message || String(error),
      },
      { status: 500 },
    )
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

