export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  createdAt: Date
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
  customerId?: string | null
  customer?: Customer
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: "USD" | "IQD"
  status: "draft" | "sent" | "paid" | "overdue"
  issueDate: Date
  dueDate: Date
  notes?: string
  createdAt: Date
}

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  primaryColor?: string
}

export interface PaymentVoucher {
  id: string
  voucherNumber: string
  customerId?: string | null
  customer?: Customer
  paymentDate: Date
  currency: "USD" | "IQD"
  amount: number
  paymentMethod?: string
  referenceNumber?: string
  description?: string
  status: "draft" | "completed" | "cancelled"
  notes?: string
  name?: string
  accountantName?: string
  createdAt: Date
}

export interface ReceiptVoucher {
  id: string
  voucherNumber: string
  customerId?: string | null
  customer?: Customer
  receiptDate: Date
  currency: "USD" | "IQD"
  amount: number
  paymentMethod?: string
  referenceNumber?: string
  description?: string
  status: "draft" | "completed" | "cancelled"
  notes?: string
  deliveredBy?: string
  receivedBy?: string
  createdAt: Date
}

export interface User {
  username: string
  isAuthenticated: boolean
}
