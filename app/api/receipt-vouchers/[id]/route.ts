import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { resolveCustomerId } from "@/lib/resolve-customer"
import { updateReceiptVoucherRecord } from "@/lib/receipt-voucher-db"

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

    const resolvedCustomerId = await resolveCustomerId({
      customer_id: customer_id || null,
      customer_name,
      customer_email,
      customer_phone,
    })

    const voucher = await updateReceiptVoucherRecord(params.id, {
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

    if (!voucher) {
      return NextResponse.json({ error: "Receipt voucher not found" }, { status: 404 })
    }

    const [voucherWithCustomer] = await sql`
      SELECT 
        rv.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM receipt_vouchers rv
      LEFT JOIN customers c ON rv.customer_id = c.id
      WHERE rv.id = ${voucher.id}
    `

    return NextResponse.json(voucherWithCustomer)
  } catch (error) {
    console.error("Error updating receipt voucher:", error)
    const dbError = error as { message?: string }
    return NextResponse.json(
      {
        error: "Failed to update receipt voucher",
        details: dbError.message || String(error),
      },
      { status: 500 },
    )
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

