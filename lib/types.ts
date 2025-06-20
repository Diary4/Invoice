export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
}

export interface InvoiceItem {
  id?: number
  invoice_id?: number
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id?: number
  invoice_number: string
  customer_id: number
  customer?: Customer
  issue_date: string
  due_date: string
  currency: "USD" | "IQD"
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
  items?: InvoiceItem[]
  created_at?: string
  updated_at?: string
}
