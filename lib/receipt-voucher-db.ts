import { sql } from "@/lib/db"

export type ReceiptVoucherWriteData = {
  voucher_number: string
  customer_id: number | null
  receipt_date: string
  currency: string
  amount: number
  payment_method: string | null
  reference_number: string | null
  description: string | null
  descriptionsArray: Array<{ description: string; amount: number | string }> | string[] | null
  status: string
  notes: string | null
  delivered_by: string | null
  received_by: string | null
  amount_language: string
}

function isMissingColumnError(error: unknown) {
  const message = String(error).toLowerCase()
  return message.includes("column") && message.includes("does not exist")
}

function buildDescriptionText(
  description: string | null,
  descriptionsArray: ReceiptVoucherWriteData["descriptionsArray"],
) {
  if (description) {
    return description
  }

  if (!descriptionsArray || descriptionsArray.length === 0) {
    return null
  }

  return descriptionsArray
    .map((item) => {
      if (typeof item === "string") {
        return item
      }
      return item.description
    })
    .filter(Boolean)
    .join("; ")
}

export async function insertReceiptVoucher(data: ReceiptVoucherWriteData) {
  const descriptionsJson = data.descriptionsArray ? JSON.stringify(data.descriptionsArray) : null
  const descriptionText = buildDescriptionText(data.description, data.descriptionsArray)

  try {
    const [voucher] = await sql`
      INSERT INTO receipt_vouchers (
        voucher_number, customer_id, receipt_date, currency,
        amount, payment_method, reference_number, description, descriptions, status, notes, delivered_by, received_by, amount_language
      )
      VALUES (
        ${data.voucher_number}, ${data.customer_id}, ${data.receipt_date}, ${data.currency},
        ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${data.description},
        ${descriptionsJson}::jsonb, ${data.status}, ${data.notes}, ${data.delivered_by}, ${data.received_by}, ${data.amount_language}
      )
      RETURNING *
    `
    return voucher
  } catch (firstError) {
    if (!isMissingColumnError(firstError)) {
      throw firstError
    }

    try {
      const [voucher] = await sql`
        INSERT INTO receipt_vouchers (
          voucher_number, customer_id, receipt_date, currency,
          amount, payment_method, reference_number, description, descriptions, status, notes, delivered_by, received_by
        )
        VALUES (
          ${data.voucher_number}, ${data.customer_id}, ${data.receipt_date}, ${data.currency},
          ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${data.description},
          ${descriptionsJson}::jsonb, ${data.status}, ${data.notes}, ${data.delivered_by}, ${data.received_by}
        )
        RETURNING *
      `
      return voucher
    } catch (secondError) {
      if (!isMissingColumnError(secondError)) {
        throw secondError
      }

      try {
        const [voucher] = await sql`
          INSERT INTO receipt_vouchers (
            voucher_number, customer_id, receipt_date, currency,
            amount, payment_method, reference_number, description, status, notes, delivered_by, received_by
          )
          VALUES (
            ${data.voucher_number}, ${data.customer_id}, ${data.receipt_date}, ${data.currency},
            ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${descriptionText},
            ${data.status}, ${data.notes}, ${data.delivered_by}, ${data.received_by}
          )
          RETURNING *
        `
        return voucher
      } catch (thirdError) {
        if (!isMissingColumnError(thirdError)) {
          throw thirdError
        }

        const [voucher] = await sql`
          INSERT INTO receipt_vouchers (
            voucher_number, customer_id, receipt_date, currency,
            amount, payment_method, reference_number, description, status, notes
          )
          VALUES (
            ${data.voucher_number}, ${data.customer_id}, ${data.receipt_date}, ${data.currency},
            ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${descriptionText},
            ${data.status}, ${data.notes}
          )
          RETURNING *
        `
        return voucher
      }
    }
  }
}

export async function updateReceiptVoucherRecord(id: string, data: Omit<ReceiptVoucherWriteData, "voucher_number">) {
  const descriptionsJson = data.descriptionsArray ? JSON.stringify(data.descriptionsArray) : null
  const descriptionText = buildDescriptionText(data.description, data.descriptionsArray)

  try {
    const [voucher] = await sql`
      UPDATE receipt_vouchers
      SET
        customer_id = ${data.customer_id},
        receipt_date = ${data.receipt_date},
        currency = ${data.currency},
        amount = ${data.amount},
        payment_method = ${data.payment_method},
        reference_number = ${data.reference_number},
        description = ${data.description},
        descriptions = ${descriptionsJson}::jsonb,
        status = ${data.status},
        notes = ${data.notes},
        delivered_by = ${data.delivered_by},
        received_by = ${data.received_by},
        amount_language = ${data.amount_language},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return voucher
  } catch (firstError) {
    if (!isMissingColumnError(firstError)) {
      throw firstError
    }

    try {
      const [voucher] = await sql`
        UPDATE receipt_vouchers
        SET
          customer_id = ${data.customer_id},
          receipt_date = ${data.receipt_date},
          currency = ${data.currency},
          amount = ${data.amount},
          payment_method = ${data.payment_method},
          reference_number = ${data.reference_number},
          description = ${data.description},
          descriptions = ${descriptionsJson}::jsonb,
          status = ${data.status},
          notes = ${data.notes},
          delivered_by = ${data.delivered_by},
          received_by = ${data.received_by},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      return voucher
    } catch (secondError) {
      if (!isMissingColumnError(secondError)) {
        throw secondError
      }

      try {
        const [voucher] = await sql`
          UPDATE receipt_vouchers
          SET
            customer_id = ${data.customer_id},
            receipt_date = ${data.receipt_date},
            currency = ${data.currency},
            amount = ${data.amount},
            payment_method = ${data.payment_method},
            reference_number = ${data.reference_number},
            description = ${descriptionText},
            status = ${data.status},
            notes = ${data.notes},
            delivered_by = ${data.delivered_by},
            received_by = ${data.received_by},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        return voucher
      } catch (thirdError) {
        if (!isMissingColumnError(thirdError)) {
          throw thirdError
        }

        const [voucher] = await sql`
          UPDATE receipt_vouchers
          SET
            customer_id = ${data.customer_id},
            receipt_date = ${data.receipt_date},
            currency = ${data.currency},
            amount = ${data.amount},
            payment_method = ${data.payment_method},
            reference_number = ${data.reference_number},
            description = ${descriptionText},
            status = ${data.status},
            notes = ${data.notes},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        return voucher
      }
    }
  }
}
