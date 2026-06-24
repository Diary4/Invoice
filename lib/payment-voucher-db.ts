import { sql } from "@/lib/db"

export type PaymentVoucherWriteData = {
  voucher_number: string
  customer_id: number | null
  payment_date: string
  currency: string
  amount: number
  payment_method: string | null
  reference_number: string | null
  description: string | null
  descriptionsArray: Array<{ description: string; amount: number | string }> | string[] | null
  status: string
  notes: string | null
  name: string | null
  accountant_name: string | null
  amount_language: string
}

function isMissingColumnError(error: unknown) {
  const message = String(error).toLowerCase()
  return message.includes("column") && message.includes("does not exist")
}

function buildDescriptionText(
  description: string | null,
  descriptionsArray: PaymentVoucherWriteData["descriptionsArray"],
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

export async function insertPaymentVoucher(data: PaymentVoucherWriteData) {
  const descriptionsJson = data.descriptionsArray ? JSON.stringify(data.descriptionsArray) : null
  const descriptionText = buildDescriptionText(data.description, data.descriptionsArray)

  try {
    const [voucher] = await sql`
      INSERT INTO payment_vouchers (
        voucher_number, customer_id, payment_date, currency,
        amount, payment_method, reference_number, description, descriptions, status, notes, name, accountant_name, amount_language
      )
      VALUES (
        ${data.voucher_number}, ${data.customer_id}, ${data.payment_date}, ${data.currency},
        ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${data.description},
        ${descriptionsJson}::jsonb, ${data.status}, ${data.notes}, ${data.name}, ${data.accountant_name}, ${data.amount_language}
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
        INSERT INTO payment_vouchers (
          voucher_number, customer_id, payment_date, currency,
          amount, payment_method, reference_number, description, descriptions, status, notes, name, accountant_name
        )
        VALUES (
          ${data.voucher_number}, ${data.customer_id}, ${data.payment_date}, ${data.currency},
          ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${data.description},
          ${descriptionsJson}::jsonb, ${data.status}, ${data.notes}, ${data.name}, ${data.accountant_name}
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
          INSERT INTO payment_vouchers (
            voucher_number, customer_id, payment_date, currency,
            amount, payment_method, reference_number, description, status, notes, name, accountant_name
          )
          VALUES (
            ${data.voucher_number}, ${data.customer_id}, ${data.payment_date}, ${data.currency},
            ${data.amount}, ${data.payment_method}, ${data.reference_number}, ${descriptionText},
            ${data.status}, ${data.notes}, ${data.name}, ${data.accountant_name}
          )
          RETURNING *
        `
        return voucher
      } catch (thirdError) {
        if (!isMissingColumnError(thirdError)) {
          throw thirdError
        }

        const [voucher] = await sql`
          INSERT INTO payment_vouchers (
            voucher_number, customer_id, payment_date, currency,
            amount, payment_method, reference_number, description, status, notes
          )
          VALUES (
            ${data.voucher_number}, ${data.customer_id}, ${data.payment_date}, ${data.currency},
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

export async function updatePaymentVoucherRecord(id: string, data: Omit<PaymentVoucherWriteData, "voucher_number">) {
  const descriptionsJson = data.descriptionsArray ? JSON.stringify(data.descriptionsArray) : null
  const descriptionText = buildDescriptionText(data.description, data.descriptionsArray)

  try {
    const [voucher] = await sql`
      UPDATE payment_vouchers
      SET
        customer_id = ${data.customer_id},
        payment_date = ${data.payment_date},
        currency = ${data.currency},
        amount = ${data.amount},
        payment_method = ${data.payment_method},
        reference_number = ${data.reference_number},
        description = ${data.description},
        descriptions = ${descriptionsJson}::jsonb,
        status = ${data.status},
        notes = ${data.notes},
        name = ${data.name},
        accountant_name = ${data.accountant_name},
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
        UPDATE payment_vouchers
        SET
          customer_id = ${data.customer_id},
          payment_date = ${data.payment_date},
          currency = ${data.currency},
          amount = ${data.amount},
          payment_method = ${data.payment_method},
          reference_number = ${data.reference_number},
          description = ${data.description},
          descriptions = ${descriptionsJson}::jsonb,
          status = ${data.status},
          notes = ${data.notes},
          name = ${data.name},
          accountant_name = ${data.accountant_name},
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
          UPDATE payment_vouchers
          SET
            customer_id = ${data.customer_id},
            payment_date = ${data.payment_date},
            currency = ${data.currency},
            amount = ${data.amount},
            payment_method = ${data.payment_method},
            reference_number = ${data.reference_number},
            description = ${descriptionText},
            status = ${data.status},
            notes = ${data.notes},
            name = ${data.name},
            accountant_name = ${data.accountant_name},
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
          UPDATE payment_vouchers
          SET
            customer_id = ${data.customer_id},
            payment_date = ${data.payment_date},
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
