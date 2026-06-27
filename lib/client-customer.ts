type CustomerInput = {
  name: string
  email?: string
  phone?: string
  address?: string
}

export function parseCustomerIdForApi(customerId?: string | null): number | null {
  if (!customerId || customerId === "__manual__" || customerId === "__none__") {
    return null
  }

  const parsedId = Number.parseInt(customerId, 10)
  return Number.isNaN(parsedId) ? null : parsedId
}

export function getCustomerApiPayload(params: {
  customerId?: string | null
  customer?: CustomerInput | null
}) {
  return {
    customer_id: parseCustomerIdForApi(params.customerId),
    customer_name: params.customer?.name?.trim() || null,
    customer_email: params.customer?.email?.trim() || null,
    customer_phone: params.customer?.phone?.trim() || null,
    customer_address: params.customer?.address?.trim() || null,
  }
}

export async function ensureCustomerInDatabase(params: {
  customerId?: string | null
  customer?: CustomerInput | null
}): Promise<number | null> {
  const payload = getCustomerApiPayload(params)

  if (payload.customer_id) {
    return payload.customer_id
  }

  const name = payload.customer_name
  if (!name) {
    return null
  }

  const response = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email: payload.customer_email || "",
      phone: payload.customer_phone || "",
      address: payload.customer_address || "",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to save customer to database")
  }

  const customer = await response.json()
  return customer.id
}
