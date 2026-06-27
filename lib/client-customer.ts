type CustomerInput = {
  name: string
  email?: string
  phone?: string
  address?: string
}

export async function ensureCustomerInDatabase(params: {
  customerId?: string | null
  customer?: CustomerInput | null
}): Promise<number | null> {
  if (params.customerId) {
    const parsedId = Number.parseInt(params.customerId, 10)
    if (!Number.isNaN(parsedId)) {
      return parsedId
    }
  }

  const name = params.customer?.name?.trim()
  if (!name) {
    return null
  }

  const response = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email: params.customer?.email?.trim() || "",
      phone: params.customer?.phone?.trim() || "",
      address: params.customer?.address?.trim() || "",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to save customer to database")
  }

  const newCustomer = await response.json()
  return newCustomer.id
}
