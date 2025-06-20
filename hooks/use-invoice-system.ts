"use client"

import { useState, useCallback } from "react"
import jsPDF from "jspdf"
import { formatCurrency } from "../lib/currency"

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
  customerId: string
  customer: Customer
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
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
}

export function useInvoiceSystem() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Your Company Name",
    address: "123 Business St, City, State 12345",
    phone: "(555) 123-4567",
    email: "contact@yourcompany.com",
    website: "www.yourcompany.com",
    logo: "/placeholder-logo.png",
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

  // Company info management
  const updateCompanyInfo = useCallback((updates: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => ({ ...prev, ...updates }))
  }, [])

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
        doc.text(formatCurrency(item.price, invoice.currency), 145, currentY)
        doc.text(formatCurrency(item.total, invoice.currency), 170, currentY)
        currentY += 10
      })

      // Totals section
      const totalsY = currentY + 20
      doc.setFont("helvetica", "normal")
      doc.text("Subtotal:", 130, totalsY)
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), 170, totalsY)

      doc.text(`Tax (${invoice.taxRate}%):`, 130, totalsY + 10)
      doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 170, totalsY + 10)

      doc.setFont("helvetica", "bold")
      doc.text("Total:", 130, totalsY + 20)
      doc.text(formatCurrency(invoice.total, invoice.currency), 170, totalsY + 20)

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
    companyInfo,
    stats,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateCompanyInfo,
    generateInvoicePDF,
  }
}
