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
  customer_id?: number | null
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

export interface PaymentVoucher {
  id?: number
  voucher_number: string
  customer_id?: number | null
  customer?: Customer
  payment_date: string
  currency: "USD" | "IQD"
  amount: number
  payment_method?: string
  reference_number?: string
  description?: string
  status: "draft" | "completed" | "cancelled"
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ReceiptVoucher {
  id?: number
  voucher_number: string
  customer_id?: number | null
  customer?: Customer
  receipt_date: string
  currency: "USD" | "IQD"
  amount: number
  payment_method?: string
  reference_number?: string
  description?: string
  status: "draft" | "completed" | "cancelled"
  notes?: string
  created_at?: string
  updated_at?: string
}
