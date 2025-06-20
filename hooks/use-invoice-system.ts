"use client"

import { useState } from "react"
import type { Customer, Invoice, CompanyInfo } from "../types"
import jsPDF from "jspdf"

export function useInvoiceSystem() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Your Company Name",
    address: "123 Business Street",
    city: "Business City",
    state: "BC",
    zipCode: "12345",
    phone: "(555) 123-4567",
    email: "info@yourcompany.com",
    website: "https://yourcompany.com",
    logo: "",
  })

  // Customer operations
  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setCustomers((prev) => [...prev, newCustomer])
    return newCustomer
  }

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((customer) => (customer.id === id ? { ...customer, ...customerData } : customer)))
  }

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
    // Also delete associated invoices
    setInvoices((prev) => prev.filter((invoice) => invoice.customerId !== id))
  }

  // Invoice operations
  const addInvoice = (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => {
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
    }
    setInvoices((prev) => [...prev, newInvoice])
    return newInvoice
  }

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, ...invoiceData } : invoice)))
  }

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
  }

  const getInvoicesByCustomer = (customerId: string) => {
    return invoices.filter((invoice) => invoice.customerId === customerId)
  }

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info)
  }

  const generateInvoicePDF = (invoice: Invoice, customer: Customer | undefined) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Add company logo if available
    if (companyInfo.logo) {
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          doc.addImage(img, "JPEG", 20, 20, 40, 30)
          generatePDFContent()
        }
        img.onerror = () => {
          generatePDFContent()
        }
        img.src = companyInfo.logo
        return
      } catch (error) {
        console.log("Could not add logo to PDF")
      }
    }

    generatePDFContent()

    function generatePDFContent() {
      // Company Information
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(companyInfo.name, companyInfo.logo ? 70 : 20, 30)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(companyInfo.address, companyInfo.logo ? 70 : 20, 38)
      doc.text(`${companyInfo.city}, ${companyInfo.state} ${companyInfo.zipCode}`, companyInfo.logo ? 70 : 20, 44)
      doc.text(`Phone: ${companyInfo.phone}`, companyInfo.logo ? 70 : 20, 50)
      doc.text(`Email: ${companyInfo.email}`, companyInfo.logo ? 70 : 20, 56)
      if (companyInfo.website) {
        doc.text(`Website: ${companyInfo.website}`, companyInfo.logo ? 70 : 20, 62)
      }

      // Invoice Title
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("INVOICE", pageWidth - 60, 30)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(invoice.invoiceNumber, pageWidth - 60, 40)

      // Invoice Details
      const startY = 80
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Bill To:", 20, startY)

      doc.setFont("helvetica", "normal")
      if (customer) {
        doc.text(customer.name, 20, startY + 8)
        doc.text(customer.email, 20, startY + 16)
        if (customer.phone) doc.text(customer.phone, 20, startY + 24)
        if (customer.address) doc.text(customer.address, 20, startY + 32)
      }

      // Invoice Info (right side)
      doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - 80, startY + 8)
      if (invoice.dueDate) {
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 80, startY + 16)
      }
      doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 80, startY + 24)

      // Items Table Header
      const tableStartY = startY + 50
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")

      // Table header background
      doc.setFillColor(41, 128, 185)
      doc.rect(20, tableStartY - 5, pageWidth - 40, 12, "F")

      // Table header text
      doc.setTextColor(255, 255, 255)
      doc.text("Description", 25, tableStartY + 2)
      doc.text("Qty", pageWidth - 120, tableStartY + 2)
      doc.text("Rate", pageWidth - 80, tableStartY + 2)
      doc.text("Amount", pageWidth - 40, tableStartY + 2)

      // Table rows
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")
      let currentY = tableStartY + 15

      invoice.items.forEach((item, index) => {
        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(20, currentY - 5, pageWidth - 40, 12, "F")
        }

        doc.text(item.description, 25, currentY + 2)
        doc.text(item.quantity.toString(), pageWidth - 120, currentY + 2)
        doc.text(`$${item.price.toFixed(2)}`, pageWidth - 80, currentY + 2)
        doc.text(`$${item.total.toFixed(2)}`, pageWidth - 40, currentY + 2)

        currentY += 12
      })

      // Table border
      doc.setDrawColor(0, 0, 0)
      doc.rect(20, tableStartY - 5, pageWidth - 40, currentY - tableStartY + 5)

      // Totals
      const totalsY = currentY + 20
      const totalsX = pageWidth - 80

      doc.setFont("helvetica", "normal")
      doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, totalsX, totalsY)
      doc.text(`Tax (${invoice.taxRate}%): $${invoice.tax.toFixed(2)}`, totalsX, totalsY + 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(`Total: $${invoice.total.toFixed(2)}`, totalsX, totalsY + 20)

      // Notes
      if (invoice.notes) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("Notes:", 20, totalsY + 40)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40)
        doc.text(splitNotes, 20, totalsY + 50)
      }

      // Footer
      doc.setFont("helvetica", "italic")
      doc.setFontSize(10)
      doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 30, { align: "center" })
      doc.text(`For questions, contact: ${companyInfo.email}`, pageWidth / 2, pageHeight - 20, { align: "center" })

      // Save the PDF
      doc.save(`${invoice.invoiceNumber}.pdf`)
    }
  }

  return {
    customers,
    invoices,
    companyInfo,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateCompanyInfo,
    getInvoicesByCustomer,
    generateInvoicePDF,
  }
}
