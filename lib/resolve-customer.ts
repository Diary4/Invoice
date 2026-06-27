import { sql } from "@/lib/db"

export async function findOrCreateCustomer(params: {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}): Promise<number> {
  const name = params.name.trim()

  const [existing] = await sql`
    SELECT id, email, phone, address
    FROM customers
    WHERE LOWER(TRIM(name)) = LOWER(${name})
    LIMIT 1
  `

  if (existing) {
    const email = params.email?.trim() || null
    const phone = params.phone?.trim() || null
    const address = params.address?.trim() || null

    if (
      (email && !existing.email) ||
      (phone && !existing.phone) ||
      (address && !existing.address)
    ) {
      await sql`
        UPDATE customers
        SET
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          address = COALESCE(${address}, address)
        WHERE id = ${existing.id}
      `
    }

    return existing.id
  }

  const [customer] = await sql`
    INSERT INTO customers (name, email, phone, address)
    VALUES (
      ${name},
      ${params.email?.trim() || null},
      ${params.phone?.trim() || null},
      ${params.address?.trim() || null}
    )
    RETURNING id
  `

  return customer.id
}

export async function resolveCustomerId(params: {
  customer_id?: number | string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  customer_address?: string | null
}): Promise<number | null> {
  const { customer_id, customer_name, customer_email, customer_phone, customer_address } = params

  if (customer_id !== null && customer_id !== undefined && customer_id !== "") {
    const parsedId =
      typeof customer_id === "number" ? customer_id : Number.parseInt(String(customer_id), 10)

    if (!Number.isNaN(parsedId)) {
      const [existing] = await sql`
        SELECT id FROM customers WHERE id = ${parsedId}
      `
      if (existing) {
        return existing.id
      }
    }
  }

  const name = customer_name?.trim()
  if (!name) {
    return null
  }

  return findOrCreateCustomer({
    name,
    email: customer_email,
    phone: customer_phone,
    address: customer_address,
  })
}
