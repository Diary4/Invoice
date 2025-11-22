"use client"

import { useState, useCallback } from "react"
import jsPDF from "jspdf"
import { formatCurrencyForPDF } from "../lib/currency"
import type { PaymentVoucher, ReceiptVoucher, Customer } from "../types"

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
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: "USD" | "IQD"
  status: "draft" | "sent" | "paid" | "overdue"
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

export function useInvoiceSystem() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([])
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Your Company Name",
    address: "123 Business St, City, State 12345",
    phone: "(555) 123-4567",
    email: "contact@yourcompany.com",
    website: "www.yourcompany.com",
    logo: "/placeholder-logo.png",
    primaryColor: "#000000",
  })

  // Customer management
  const addCustomer = useCallback((customerData: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setCustomers((prev) => [...prev, newCustomer])
    return newCustomer
  }, [])

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((customer) => (customer.id === id ? { ...customer, ...updates } : customer)))
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
    setInvoices((prev) => prev.filter((invoice) => invoice.customerId !== id))
  }, [])

  // Invoice management
  const addInvoice = useCallback(
    (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => {
      const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        invoiceNumber,
        createdAt: new Date(),
      }
      setInvoices((prev) => [...prev, newInvoice])
      return newInvoice
    },
    [invoices.length],
  )

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, ...updates } : invoice)))
  }, [])

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
  }, [])

  // Payment Voucher management
  const addPaymentVoucher = useCallback(
    (voucherData: Omit<PaymentVoucher, "id" | "voucherNumber" | "createdAt">) => {
      const voucherNumber = `PV-${String(paymentVouchers.length + 1).padStart(4, "0")}`
      const newVoucher: PaymentVoucher = {
        ...voucherData,
        id: Date.now().toString(),
        voucherNumber,
        createdAt: new Date(),
      }
      setPaymentVouchers((prev) => [...prev, newVoucher])
      return newVoucher
    },
    [paymentVouchers.length],
  )

  const updatePaymentVoucher = useCallback((id: string, updates: Partial<PaymentVoucher>) => {
    setPaymentVouchers((prev) => prev.map((voucher) => (voucher.id === id ? { ...voucher, ...updates } : voucher)))
  }, [])

  const deletePaymentVoucher = useCallback((id: string) => {
    setPaymentVouchers((prev) => prev.filter((voucher) => voucher.id !== id))
  }, [])

  // Receipt Voucher management
  const addReceiptVoucher = useCallback(
    (voucherData: Omit<ReceiptVoucher, "id" | "voucherNumber" | "createdAt">) => {
      const voucherNumber = `RV-${String(receiptVouchers.length + 1).padStart(4, "0")}`
      const newVoucher: ReceiptVoucher = {
        ...voucherData,
        id: Date.now().toString(),
        voucherNumber,
        createdAt: new Date(),
      }
      setReceiptVouchers((prev) => [...prev, newVoucher])
      return newVoucher
    },
    [receiptVouchers.length],
  )

  const updateReceiptVoucher = useCallback((id: string, updates: Partial<ReceiptVoucher>) => {
    setReceiptVouchers((prev) => prev.map((voucher) => (voucher.id === id ? { ...voucher, ...updates } : voucher)))
  }, [])

  const deleteReceiptVoucher = useCallback((id: string) => {
    setReceiptVouchers((prev) => prev.filter((voucher) => voucher.id !== id))
  }, [])

  // Company info management
  const updateCompanyInfo = useCallback((updates: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => ({ ...prev, ...updates }))
  }, [])

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
      : [0, 0, 0]
  }

  // PDF Generation
  const generateInvoicePDF = useCallback(
    async (invoice: Invoice) => {
      const doc = new jsPDF()

      // Add company logo if available
      if (companyInfo.logo) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = companyInfo.logo!
          })
          doc.addImage(img, "PNG", 20, 20, 40, 40)
        } catch (error) {
          console.log("Logo could not be loaded, continuing without logo")
        }
      }

      // Company information
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(companyInfo.name, 70, 30)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(companyInfo.address, 70, 40)
      doc.text(companyInfo.phone, 70, 47)
      doc.text(companyInfo.email, 70, 54)
      if (companyInfo.website) {
        doc.text(companyInfo.website, 70, 61)
      }

      // Invoice title and number
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("INVOICE", 20, 90)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 105)
      doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 20, 115)
      doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 20, 125)

      // Customer information
      if (invoice.customer) {
        doc.setFont("helvetica", "bold")
        doc.text("Bill To:", 120, 105)
        doc.setFont("helvetica", "normal")
        doc.text(invoice.customer.name, 120, 115)
        doc.text(invoice.customer.email, 120, 125)
        if (invoice.customer.phone) {
          doc.text(invoice.customer.phone, 120, 135)
        }
        if (invoice.customer.address) {
          doc.text(invoice.customer.address, 120, 145)
        }
      }

      // Items table header
      const startY = 160
      doc.setFont("helvetica", "bold")
      doc.setFillColor(240, 240, 240)
      doc.rect(20, startY, 170, 10, "F")
      doc.text("Description", 25, startY + 7)
      doc.text("Qty", 120, startY + 7)
      doc.text("Price", 140, startY + 7)
      doc.text("Total", 165, startY + 7)

      // Items table content
      doc.setFont("helvetica", "normal")
      let currentY = startY + 15

      invoice.items.forEach((item, index) => {
        // Alternating row colors
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, currentY - 5, 170, 10, "F")
        }

        doc.text(item.description, 25, currentY)
        doc.text(item.quantity.toString(), 125, currentY)
        doc.text(formatCurrencyForPDF(item.price, invoice.currency as "USD" | "IQD"), 145, currentY)
        doc.text(formatCurrencyForPDF(item.total, invoice.currency as "USD" | "IQD"), 170, currentY)
        currentY += 10
      })

      // Totals section
      const totalsY = currentY + 20
      doc.setFont("helvetica", "normal")
      doc.text("Subtotal:", 130, totalsY)
      doc.text(formatCurrencyForPDF(invoice.subtotal, invoice.currency as "USD" | "IQD"), 170, totalsY)

      doc.text(`Tax (${invoice.taxRate}%):`, 130, totalsY + 10)
      doc.text(formatCurrencyForPDF(invoice.taxAmount, invoice.currency as "USD" | "IQD"), 170, totalsY + 10)

      doc.setFont("helvetica", "bold")
      doc.text("Total:", 130, totalsY + 20)
      doc.text(formatCurrencyForPDF(invoice.total, invoice.currency as "USD" | "IQD"), 170, totalsY + 20)

      // Notes section
      if (invoice.notes) {
        doc.setFont("helvetica", "bold")
        doc.text("Notes:", 20, totalsY + 40)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(invoice.notes, 170)
        doc.text(splitNotes, 20, totalsY + 50)
      }

      // Footer
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Thank you for your business! For questions, contact us at ${companyInfo.email}`, 20, 280)

      // Save the PDF
      doc.save(`${invoice.invoiceNumber}.pdf`)
    },
    [companyInfo],
  )

  const generatePaymentVoucherPDF = useCallback(
    async (voucher: PaymentVoucher) => {
      const doc = new jsPDF()

      // Add company logo if available
      if (companyInfo.logo) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = companyInfo.logo!
          })
          doc.addImage(img, "PNG", 20, 20, 40, 40)
        } catch (error) {
          console.log("Logo could not be loaded, continuing without logo")
        }
      }

      // Company information
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      // Apply primary color to company name if set
      if (companyInfo.primaryColor) {
        const [r, g, b] = hexToRgb(companyInfo.primaryColor)
        doc.setTextColor(r, g, b)
      }
      doc.text(companyInfo.name, 70, 30)
      // Reset text color to black for other text
      doc.setTextColor(0, 0, 0)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(companyInfo.address, 70, 40)
      doc.text(companyInfo.phone, 70, 47)
      doc.text(companyInfo.email, 70, 54)
      if (companyInfo.website) {
        doc.text(companyInfo.website, 70, 61)
      }

      // Voucher title and number
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("PAYMENT VOUCHER", 20, 90)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Voucher #: ${voucher.voucherNumber}`, 20, 105)
      doc.text(`Date: ${new Date(voucher.paymentDate).toLocaleDateString()}`, 20, 115)

      // Customer information
      if (voucher.customer) {
        doc.setFont("helvetica", "bold")
        doc.text("Paid To:", 120, 105)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.customer.name, 120, 115)
        doc.text(voucher.customer.email, 120, 125)
        if (voucher.customer.phone) {
          doc.text(voucher.customer.phone, 120, 135)
        }
        if (voucher.customer.address) {
          doc.text(voucher.customer.address, 120, 145)
        }
      }

      // Payment details
      let detailsY = 160
      if (voucher.paymentMethod) {
        doc.setFont("helvetica", "bold")
        doc.text("Payment Method:", 20, detailsY)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.paymentMethod.replace("_", " ").toUpperCase(), 80, detailsY)
        detailsY += 10
      }
      if (voucher.referenceNumber) {
        doc.setFont("helvetica", "bold")
        doc.text("Reference Number:", 20, detailsY)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.referenceNumber, 80, detailsY)
        detailsY += 10
      }

      // Amount section
      const amountY = detailsY + 20
      doc.setFont("helvetica", "bold")
      doc.text("Amount Paid:", 130, amountY)
      doc.setFontSize(16)
      doc.text(formatCurrencyForPDF(voucher.amount, voucher.currency as "USD" | "IQD"), 130, amountY + 15)

      // Description
      if (voucher.description) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Description:", 20, amountY + 30)
        doc.setFont("helvetica", "normal")
        const splitDesc = doc.splitTextToSize(voucher.description, 170)
        doc.text(splitDesc, 20, amountY + 40)
      }

      // Notes
      if (voucher.notes) {
        const notesY = amountY + (voucher.description ? 60 : 40)
        doc.setFont("helvetica", "bold")
        doc.text("Notes:", 20, notesY)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(voucher.notes, 170)
        doc.text(splitNotes, 20, notesY + 10)
      }

      // Footer
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Thank you for your payment! For questions, contact us at ${companyInfo.email}`, 20, 280)

      // Save the PDF
      doc.save(`${voucher.voucherNumber}.pdf`)
    },
    [companyInfo],
  )

  const generateReceiptVoucherPDF = useCallback(
    async (voucher: ReceiptVoucher) => {
      const doc = new jsPDF()

      // Add company logo if available
      if (companyInfo.logo) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = companyInfo.logo!
          })
          doc.addImage(img, "PNG", 20, 20, 40, 40)
        } catch (error) {
          console.log("Logo could not be loaded, continuing without logo")
        }
      }

      // Company information
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      // Apply primary color to company name if set
      if (companyInfo.primaryColor) {
        const [r, g, b] = hexToRgb(companyInfo.primaryColor)
        doc.setTextColor(r, g, b)
      }
      doc.text(companyInfo.name, 70, 30)
      // Reset text color to black for other text
      doc.setTextColor(0, 0, 0)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(companyInfo.address, 70, 40)
      doc.text(companyInfo.phone, 70, 47)
      doc.text(companyInfo.email, 70, 54)
      if (companyInfo.website) {
        doc.text(companyInfo.website, 70, 61)
      }

      // Voucher title and number
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("RECEIPT VOUCHER", 20, 90)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Voucher #: ${voucher.voucherNumber}`, 20, 105)
      doc.text(`Date: ${new Date(voucher.receiptDate).toLocaleDateString()}`, 20, 115)

      // Customer information
      if (voucher.customer) {
        doc.setFont("helvetica", "bold")
        doc.text("Received From:", 120, 105)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.customer.name, 120, 115)
        doc.text(voucher.customer.email, 120, 125)
        if (voucher.customer.phone) {
          doc.text(voucher.customer.phone, 120, 135)
        }
        if (voucher.customer.address) {
          doc.text(voucher.customer.address, 120, 145)
        }
      }

      // Payment details
      let detailsY = 160
      if (voucher.paymentMethod) {
        doc.setFont("helvetica", "bold")
        doc.text("Payment Method:", 20, detailsY)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.paymentMethod.replace("_", " ").toUpperCase(), 80, detailsY)
        detailsY += 10
      }
      if (voucher.referenceNumber) {
        doc.setFont("helvetica", "bold")
        doc.text("Reference Number:", 20, detailsY)
        doc.setFont("helvetica", "normal")
        doc.text(voucher.referenceNumber, 80, detailsY)
        detailsY += 10
      }

      // Amount section
      const amountY = detailsY + 20
      doc.setFont("helvetica", "bold")
      doc.text("Amount Received:", 130, amountY)
      doc.setFontSize(16)
      doc.text(formatCurrencyForPDF(voucher.amount, voucher.currency as "USD" | "IQD"), 130, amountY + 15)

      // Description
      if (voucher.description) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Description:", 20, amountY + 30)
        doc.setFont("helvetica", "normal")
        const splitDesc = doc.splitTextToSize(voucher.description, 170)
        doc.text(splitDesc, 20, amountY + 40)
      }

      // Notes
      if (voucher.notes) {
        const notesY = amountY + (voucher.description ? 60 : 40)
        doc.setFont("helvetica", "bold")
        doc.text("Notes:", 20, notesY)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(voucher.notes, 170)
        doc.text(splitNotes, 20, notesY + 10)
      }

      // Footer
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Thank you for your payment! For questions, contact us at ${companyInfo.email}`, 20, 280)

      // Save the PDF
      doc.save(`${voucher.voucherNumber}.pdf`)
    },
    [companyInfo],
  )

  // Statistics
  const stats = {
    totalCustomers: customers.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
  }

  return {
    customers,
    invoices,
    paymentVouchers,
    receiptVouchers,
    companyInfo,
    stats,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPaymentVoucher,
    updatePaymentVoucher,
    deletePaymentVoucher,
    addReceiptVoucher,
    updateReceiptVoucher,
    deleteReceiptVoucher,
    updateCompanyInfo,
    generateInvoicePDF,
    generatePaymentVoucherPDF,
    generateReceiptVoucherPDF,
  }
}
