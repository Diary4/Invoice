import { sql } from "@/lib/db"

export async function resolveCustomerId(params: {
  customer_id?: number | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
}): Promise<number | null> {
  const { customer_id, customer_name, customer_email, customer_phone } = params

  if (customer_id) {
    return customer_id
  }

  const name = customer_name?.trim()
  if (!name) {
    return null
  }

  const [customer] = await sql`
    INSERT INTO customers (name, email, phone)
    VALUES (${name}, ${customer_email || null}, ${customer_phone || null})
    RETURNING id
  `

  return customer.id
}
