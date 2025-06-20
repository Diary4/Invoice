export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
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
  invoiceNumber: string
  customerId: string
  customerName: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: string
  dueDate: string
  notes?: string
}

export interface CompanyInfo {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  logo?: string
}
