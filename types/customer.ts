export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  customerId: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  date: string
}
