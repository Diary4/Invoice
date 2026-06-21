import { sql } from "@/lib/db"

async function getNextVoucherNumber(table: "payment_vouchers" | "receipt_vouchers", prefix: "PV" | "RV"): Promise<string> {
  const pattern = `^${prefix}-[0-9]+$`

  const [result] =
    table === "payment_vouchers"
      ? await sql`
          SELECT MAX(CAST(SUBSTRING(voucher_number FROM 4) AS INTEGER)) AS max_num
          FROM payment_vouchers
          WHERE voucher_number ~ ${pattern}
        `
      : await sql`
          SELECT MAX(CAST(SUBSTRING(voucher_number FROM 4) AS INTEGER)) AS max_num
          FROM receipt_vouchers
          WHERE voucher_number ~ ${pattern}
        `

  const next = Number(result?.max_num ?? 0) + 1
  return `${prefix}-${String(next).padStart(4, "0")}`
}

export function getNextPaymentVoucherNumber() {
  return getNextVoucherNumber("payment_vouchers", "PV")
}

export function getNextReceiptVoucherNumber() {
  return getNextVoucherNumber("receipt_vouchers", "RV")
}
