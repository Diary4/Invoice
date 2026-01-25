"use client"

import { useState, useCallback } from "react"
import jsPDF from "jspdf"
import { formatCurrencyForPDF } from "../lib/currency"
import { numberToWords } from "../lib/number-to-words"
import type { PaymentVoucher, ReceiptVoucher } from "../types"

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
  pallet?: number
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
  total: number
  currency: "USD" | "IQD"
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
  amountLanguage?: "english" | "arabic" | "kurdish"
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
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Left vertical strip
      doc.setFillColor(64, 224, 208) // teal-400
      doc.rect(0, 0, 3, pageHeight, "F")

      let startY = 20

      // Header Section
      // Left side - Company name
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("For Trading solar system,", 8, startY)
      doc.text("Construction materials and", 8, startY + 6)
      doc.text("For General Trading LTD", 8, startY + 12)

      // Center - Logo and company name
      const centerX = pageWidth / 2
      if (companyInfo.logo) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = companyInfo.logo!
          })
          doc.addImage(img, "PNG", centerX - 20, startY, 40, 40)
        } catch (error) {
          console.log("Logo could not be loaded, continuing without logo")
        }
      }
      
      const companyNameParts = companyInfo.name.split(" ")
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(37, 99, 235) // blue-600
      doc.text(companyNameParts[0] || companyInfo.name, centerX, startY + 50)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Solar System Energy", centerX, startY + 56)
      doc.setTextColor(0, 0, 0) // Reset to black

      // Right side - Arabic text (placeholder)
      doc.setFontSize(10)
      doc.text("بو بازرگانی ووزه ی خور", pageWidth - 15, startY, { align: "right" })
      doc.text("و بینا سازی", pageWidth - 15, startY + 6, { align: "right" })
      doc.text("و بازرگانی گشتی", pageWidth - 15, startY + 12, { align: "right" })

      startY += 70

      // Agent Information
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(37, 99, 235) // blue-600
      doc.text("Nanas is Exclusive Agent", 8, startY)
      doc.setTextColor(220, 38, 38) // red-600
      doc.setFont("helvetica", "bold")
      doc.text("RONMA", 60, startY)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      doc.text("- Light Our Future -", 75, startY)
      doc.setTextColor(37, 99, 235)
      doc.text("in Iraq", 105, startY)
      doc.setTextColor(0, 0, 0)

      startY += 15

      // Invoice Details
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      
      // Left side - To and Sub
      if (invoice.customer) {
        doc.setFont("helvetica", "bold")
        doc.text(`To/${invoice.customer.name}`, 8, startY)
        if (invoice.customer.phone) {
          doc.text(`/${invoice.customer.phone}`, 8, startY + 6)
        }
        if (invoice.items && invoice.items.length > 0) {
          doc.text(`Sub/${invoice.items[0].description}`, 8, startY + 12)
        }
      }

      // Right side - Date and Invoice number
      const formatDate = (date: Date) => {
        const d = new Date(date)
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
      }
      doc.setFont("helvetica", "normal")
      doc.text(`Date: ${formatDate(invoice.issueDate)}`, pageWidth - 8, startY, { align: "right" })
      doc.text(`Inv: ${invoice.invoiceNumber}`, pageWidth - 8, startY + 6, { align: "right" })

      startY += 25

      // Items Table
      const tableStartX = 8
      const colWidths = [8, 60, 15, 12, 18, 25, 25]
      const colHeaders = ["NO.", "DESCRIPTION OF GOODS", "pallet", "pcs", "total - PCS", `UNIT PRICE (${invoice.currency}/PCS)`, "AMOUNT"]
      const colX = [tableStartX]
      for (let i = 1; i < colWidths.length; i++) {
        colX.push(colX[i - 1] + colWidths[i - 1])
      }

      // Table header
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setFillColor(255, 255, 255)
      doc.rect(tableStartX, startY - 5, pageWidth - 16, 8, "F")
      
      colHeaders.forEach((header, i) => {
        const align = i === 0 ? "left" : i >= colWidths.length - 2 ? "right" : i === 1 ? "left" : "center"
        doc.text(header, colX[i], startY, { align: align as any })
      })

      // Draw table borders
      doc.setDrawColor(0, 0, 0)
      doc.rect(tableStartX, startY - 5, pageWidth - 16, 8)
      colX.slice(1).forEach(x => {
        doc.line(x, startY - 5, x, startY + 3)
      })

      startY += 10

      // Table rows
      doc.setFont("helvetica", "normal")
      invoice.items.forEach((item, index) => {
        if (startY > pageHeight - 40) {
          doc.addPage()
          startY = 20
        }

        const totalQuantity = (item.quantity || 0) * ((item as any).pallet || 0)
        const rowData = [
          (index + 1).toString(),
          item.description,
          ((item as any).pallet || 0).toString(),
          (item.quantity || 0).toString(),
          totalQuantity.toString(),
          formatCurrencyForPDF(item.price, invoice.currency as "USD" | "IQD"),
          formatCurrencyForPDF(item.total, invoice.currency as "USD" | "IQD")
        ]

        // Alternating row background
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250)
          doc.rect(tableStartX, startY - 5, pageWidth - 16, 8, "F")
        }

        rowData.forEach((data, i) => {
          const align = i === 0 ? "left" : i >= colWidths.length - 2 ? "right" : i === 1 ? "left" : "center"
          doc.text(data, colX[i], startY, { align: align as any })
        })

        // Draw row borders
        doc.rect(tableStartX, startY - 5, pageWidth - 16, 8)
        colX.slice(1).forEach(x => {
          doc.line(x, startY - 5, x, startY + 3)
        })

        startY += 8
      })

      // Total row
      startY += 2
      doc.setFont("helvetica", "bold")
      doc.rect(tableStartX, startY - 5, pageWidth - 16, 8)
      doc.text("TOTAL:", colX[0], startY)
      doc.text(formatCurrencyForPDF(invoice.total, invoice.currency as "USD" | "IQD"), colX[colX.length - 1], startY, { align: "right" })
      colX.slice(1).forEach(x => {
        doc.line(x, startY - 5, x, startY + 3)
      })

      startY += 20

      // Warranty section
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Attached serial number with invoice", 8, startY)
      startY += 6
      doc.text("Ronma panel 15 years warranty", 8, startY)

      startY += 15

      // Amount in words
      const amountLanguage = (invoice as any).amountLanguage || (invoice as any).amount_language
      if (amountLanguage) {
        const amountInWords = numberToWords(
          invoice.total,
          amountLanguage as "english" | "arabic" | "kurdish",
          invoice.currency as "USD" | "IQD"
        )
        doc.setFontSize(9)
        doc.text(amountInWords, 8, startY)
        startY += 10
      }

      // Footer
      startY = pageHeight - 30
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(`Add: ${companyInfo.address}`, 8, startY)
      if (companyInfo.website) {
        doc.text(companyInfo.website, 8, startY + 5)
      }
      doc.text(companyInfo.phone, 8, startY + 10)

      // QR Code placeholder
      doc.rect(pageWidth - 30, startY, 20, 20)
      doc.setFontSize(6)
      doc.text("QR", pageWidth - 20, startY + 12, { align: "center" })

      // Decorative pattern at bottom
      const patternY = pageHeight - 8
      for (let i = 0; i < 20; i++) {
        const color = i % 3 === 0 ? [64, 224, 208] : i % 3 === 1 ? [251, 146, 60] : [59, 130, 246]
        doc.setFillColor(color[0], color[1], color[2])
        doc.rect(8 + i * 9, patternY, 8, 4, "F")
      }

      // Notes section (if any)
      if (invoice.notes) {
        startY += 15
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 16)
        doc.text(splitNotes, 8, startY)
      }

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

      // Descriptions table (before amount)
      let descriptionsY = detailsY + 20
      let descriptionsList: Array<{ description: string; amount: number | string }> = []
      
      // Handle descriptions from database (could be JSON string or array)
      if (voucher.descriptions) {
        if (Array.isArray(voucher.descriptions)) {
          // Check if it's DescriptionItem[] or string[]
          if (voucher.descriptions.length > 0) {
            if (typeof voucher.descriptions[0] === 'object' && 'description' in voucher.descriptions[0]) {
              descriptionsList = voucher.descriptions as Array<{ description: string; amount: number | string }>
            } else {
              // Convert string[] to DescriptionItem[]
              descriptionsList = (voucher.descriptions as string[]).map(desc => ({ description: desc, amount: 0 }))
            }
          }
        } else if (typeof voucher.descriptions === 'string') {
          try {
            const parsed = JSON.parse(voucher.descriptions)
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (typeof parsed[0] === 'object' && 'description' in parsed[0]) {
                descriptionsList = parsed as Array<{ description: string; amount: number | string }>
              } else {
                descriptionsList = (parsed as string[]).map(desc => ({ description: desc, amount: 0 }))
              }
            }
          } catch {
            descriptionsList = []
          }
        }
      }
      
      // Fallback to single description if no descriptions array
      if (descriptionsList.length === 0 && voucher.description) {
        descriptionsList = [{ description: voucher.description, amount: 0 }]
      }
      
      if (descriptionsList.length > 0) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Descriptions:", 20, descriptionsY)
        
        // Table header
        descriptionsY += 10
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.line(20, descriptionsY, 190, descriptionsY) // Top border
        doc.text("#", 25, descriptionsY + 7)
        doc.text("Description", 40, descriptionsY + 7)
        doc.text("Amount", 150, descriptionsY + 7)
        doc.line(20, descriptionsY + 10, 190, descriptionsY + 10) // Header bottom border
        
        // Table rows
        descriptionsY += 10
        doc.setFont("helvetica", "normal")
        descriptionsList.forEach((item: { description: string; amount: number | string }, index: number) => {
          if (descriptionsY > 250) {
            doc.addPage()
            descriptionsY = 20
          }
          doc.text((index + 1).toString(), 25, descriptionsY + 5)
          const splitDesc = doc.splitTextToSize(item.description, 100)
          doc.text(splitDesc, 40, descriptionsY + 5)
          const itemAmount = typeof item.amount === 'number' ? item.amount : (item.amount === '' || item.amount === null || item.amount === undefined ? 0 : Number.parseFloat(String(item.amount)) || 0)
          doc.text(formatCurrencyForPDF(itemAmount, voucher.currency as "USD" | "IQD"), 150, descriptionsY + 5)
          descriptionsY += Math.max(10, splitDesc.length * 5)
          doc.line(20, descriptionsY, 190, descriptionsY) // Row border
        })
        descriptionsY += 5
      }

      // Amount section (after descriptions)
      const amountY = descriptionsY + 10
      doc.setFont("helvetica", "bold")
      doc.text("Amount Paid:", 130, amountY)
      doc.setFontSize(16)
      const numericAmountX = 130
      const numericAmountY = amountY + 15
      doc.text(formatCurrencyForPDF(voucher.amount, voucher.currency as "USD" | "IQD"), numericAmountX, numericAmountY)
      
      // Amount in words - positioned horizontally next to the amount (same Y level)
      const amountLanguage = (voucher as any).amountLanguage || (voucher as any).amount_language || "english"
      if (amountLanguage) {
        const amountInWords = numberToWords(
          voucher.amount,
          amountLanguage as "english" | "arabic" | "kurdish",
          voucher.currency as "USD" | "IQD"
        )
        
        // For Arabic and Kurdish, render using HTML canvas approach since jsPDF doesn't support Arabic fonts
        if (amountLanguage === "arabic" || amountLanguage === "kurdish") {
          try {
            // Check if we're in a browser environment
            if (typeof document === "undefined" || typeof window === "undefined") {
              // Fallback: render as text if not in browser
              doc.setFontSize(12)
              doc.setFont("helvetica", "normal")
              const splitWords = doc.splitTextToSize(amountInWords, 100)
              doc.text(splitWords, 20, numericAmountY)
            } else {
              // Create a canvas element to render Arabic text with VERY LARGE font for readability
              const canvas = document.createElement("canvas")
              const ctx = canvas.getContext("2d")
              if (ctx) {
              // Use very high resolution for crisp text
              const scale = 4
              // Make font size MUCH larger - similar to the numeric amount (16pt ≈ 22px)
              // We want it to be clearly readable, so make it even larger
              const baseFontSize = 100 // VERY large font size for readability
              canvas.width = 2000 * scale
              canvas.height = 300 * scale
              
              // Scale context for high DPI
              ctx.scale(scale, scale)
              
              // Set VERY LARGE font size for Arabic/Kurdish text - bold for better visibility
              ctx.font = `bold ${baseFontSize}px Arial, 'Arabic Typesetting', 'Traditional Arabic', sans-serif`
              ctx.fillStyle = "#000000"
              ctx.textAlign = "right"
              ctx.textBaseline = "middle"
              
              // Split text into lines that fit
              const maxWidth = 1980
              const words = amountInWords.split(" ")
              const lines: string[] = []
              let currentLine = ""
              
              // Build lines from right to left (RTL)
              for (let i = words.length - 1; i >= 0; i--) {
                const testLine = currentLine ? words[i] + " " + currentLine : words[i]
                const metrics = ctx.measureText(testLine)
                if (metrics.width > maxWidth && currentLine) {
                  lines.push(currentLine)
                  currentLine = words[i]
                } else {
                  currentLine = testLine
                }
              }
              if (currentLine) {
                lines.push(currentLine)
              }
              
              // Draw text lines with proper spacing, centered vertically
              const lineHeight = baseFontSize * 1.5
              const totalHeight = lines.length * lineHeight
              const startY = (300 - totalHeight) / 2 + lineHeight / 2
              
              lines.forEach((line, index) => {
                ctx.fillText(line, 1990, startY + index * lineHeight)
              })
              
              // Convert canvas to image and add to PDF with LARGE size
              const imgData = canvas.toDataURL("image/png", 1.0) // Highest quality
              
              // Make the image large enough for readability but ensure it doesn't overlap the numeric amount
              // The numeric amount starts at x=130mm, so we need to keep Arabic text before that
              // Leave at least 5mm gap between Arabic text and numeric amount
              const maxArabicWidth = 130 - 5 - 20 // 130 (numeric x) - 5 (gap) - 20 (start x) = 105mm max
              const imgWidth = Math.min(105, 100) // mm - ensure it doesn't exceed the limit
              // Make height large enough for readability
              const imgHeight = lines.length === 1 ? 10 : Math.min(20, lines.length * 6)
              
              // Position at EXACT same Y level as numeric amount (same line)
              // But ensure it ends before x=125mm to leave space for the numeric amount at x=130mm
              // numericAmountY is the Y position of the numeric amount text
              // We need to center the image vertically at that position
              const imageY = numericAmountY - (imgHeight / 2)
              // Position at x=20, but ensure width doesn't exceed maxArabicWidth
              doc.addImage(imgData, "PNG", 20, imageY, imgWidth, imgHeight)
              } else {
                // Fallback: render as text
                doc.setFontSize(12)
                doc.setFont("helvetica", "normal")
                const splitWords = doc.splitTextToSize(amountInWords, 100)
                doc.text(splitWords, 20, numericAmountY)
              }
            }
          } catch (error) {
            console.error("Error rendering Arabic text:", error)
            // Fallback: render as text
            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            const splitWords = doc.splitTextToSize(amountInWords, 100)
            doc.text(splitWords, 20, numericAmountY)
          }
        } else {
          // For English, render normally next to the amount
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          const splitWords = doc.splitTextToSize(amountInWords, 100)
          doc.text(splitWords, 20, numericAmountY)
        }
      }

      // Notes
      let signatureY = descriptionsY
      if (voucher.notes) {
        const notesY = signatureY + 10
        doc.setFont("helvetica", "bold")
        doc.text("Notes:", 20, notesY)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(voucher.notes, 170)
        doc.text(splitNotes, 20, notesY + 10)
        signatureY = notesY + 20 + (splitNotes.length * 5)
      }

      // Signature section
      const signatureStartY = Math.max(signatureY, 220)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      
      // Name section
      if (voucher.name) {
        doc.text(voucher.name, 20, signatureStartY)
        // Signature line
        doc.line(20, signatureStartY + 5, 90, signatureStartY + 5)
        doc.setFontSize(8)
        doc.text("Signature", 20, signatureStartY + 10)
        // Date line
        doc.line(20, signatureStartY + 15, 90, signatureStartY + 15)
        doc.text("Date", 20, signatureStartY + 20)
      }
      
      // Accountant Name section
      if (voucher.accountantName) {
        doc.setFontSize(10)
        doc.text(voucher.accountantName, 120, signatureStartY)
        // Signature line
        doc.line(120, signatureStartY + 5, 190, signatureStartY + 5)
        doc.setFontSize(8)
        doc.text("Signature", 120, signatureStartY + 10)
        // Date line
        doc.line(120, signatureStartY + 15, 190, signatureStartY + 15)
        doc.text("Date", 120, signatureStartY + 20)
      }

      // Footer
      const footerY = signatureStartY + 30
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Thank you for your payment! For questions, contact us at ${companyInfo.email}`, 20, footerY)

      // Generate PDF blob and trigger print
      try {
        const pdfBlob = doc.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        
        // Create iframe for printing
        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"
        iframe.src = pdfUrl
        document.body.appendChild(iframe)
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.print()
            } catch (error) {
              console.error("Print failed, downloading instead:", error)
              doc.save(`${voucher.voucherNumber}.pdf`)
            }
            // Clean up after a delay
            setTimeout(() => {
              document.body.removeChild(iframe)
              URL.revokeObjectURL(pdfUrl)
            }, 1000)
          }, 500)
        }
      } catch (error) {
        console.error("Auto-print failed, downloading instead:", error)
        // Fallback: download if auto-print fails
        doc.save(`${voucher.voucherNumber}.pdf`)
      }
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

      // Descriptions table (before amount)
      let descriptionsY = detailsY + 20
      let descriptionsList: Array<{ description: string; amount: number | string }> = []
      
      // Handle descriptions from database (could be JSON string or array)
      if (voucher.descriptions) {
        if (Array.isArray(voucher.descriptions)) {
          // Check if it's DescriptionItem[] or string[]
          if (voucher.descriptions.length > 0) {
            if (typeof voucher.descriptions[0] === 'object' && 'description' in voucher.descriptions[0]) {
              descriptionsList = voucher.descriptions as Array<{ description: string; amount: number | string }>
            } else {
              // Convert string[] to DescriptionItem[]
              descriptionsList = (voucher.descriptions as string[]).map(desc => ({ description: desc, amount: 0 }))
            }
          }
        } else if (typeof voucher.descriptions === 'string') {
          try {
            const parsed = JSON.parse(voucher.descriptions)
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (typeof parsed[0] === 'object' && 'description' in parsed[0]) {
                descriptionsList = parsed as Array<{ description: string; amount: number | string }>
              } else {
                descriptionsList = (parsed as string[]).map(desc => ({ description: desc, amount: 0 }))
              }
            }
          } catch {
            descriptionsList = []
          }
        }
      }
      
      // Fallback to single description if no descriptions array
      if (descriptionsList.length === 0 && voucher.description) {
        descriptionsList = [{ description: voucher.description, amount: 0 }]
      }
      
      if (descriptionsList.length > 0) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Descriptions:", 20, descriptionsY)
        
        // Table header
        descriptionsY += 10
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.line(20, descriptionsY, 190, descriptionsY) // Top border
        doc.text("#", 25, descriptionsY + 7)
        doc.text("Description", 40, descriptionsY + 7)
        doc.text("Amount", 150, descriptionsY + 7)
        doc.line(20, descriptionsY + 10, 190, descriptionsY + 10) // Header bottom border
        
        // Table rows
        descriptionsY += 10
        doc.setFont("helvetica", "normal")
        descriptionsList.forEach((item: { description: string; amount: number | string }, index: number) => {
          if (descriptionsY > 250) {
            doc.addPage()
            descriptionsY = 20
          }
          doc.text((index + 1).toString(), 25, descriptionsY + 5)
          const splitDesc = doc.splitTextToSize(item.description, 100)
          doc.text(splitDesc, 40, descriptionsY + 5)
          const itemAmount = typeof item.amount === 'number' ? item.amount : (item.amount === '' || item.amount === null || item.amount === undefined ? 0 : Number.parseFloat(String(item.amount)) || 0)
          doc.text(formatCurrencyForPDF(itemAmount, voucher.currency as "USD" | "IQD"), 150, descriptionsY + 5)
          descriptionsY += Math.max(10, splitDesc.length * 5)
          doc.line(20, descriptionsY, 190, descriptionsY) // Row border
        })
        descriptionsY += 5
      }

      // Amount section (after descriptions)
      const amountY = descriptionsY + 10
      doc.setFont("helvetica", "bold")
      doc.text("Amount Received:", 130, amountY)
      doc.setFontSize(16)
      const numericAmountX = 130
      const numericAmountY = amountY + 15
      doc.text(formatCurrencyForPDF(voucher.amount, voucher.currency as "USD" | "IQD"), numericAmountX, numericAmountY)
      
      // Amount in words - positioned horizontally next to the amount (same Y level)
      const amountLanguage = (voucher as any).amountLanguage || (voucher as any).amount_language || "english"
      if (amountLanguage) {
        const amountInWords = numberToWords(
          voucher.amount,
          amountLanguage as "english" | "arabic" | "kurdish",
          voucher.currency as "USD" | "IQD"
        )
        
        // For Arabic and Kurdish, render using HTML canvas approach since jsPDF doesn't support Arabic fonts
        if (amountLanguage === "arabic" || amountLanguage === "kurdish") {
          try {
            // Check if we're in a browser environment
            if (typeof document === "undefined" || typeof window === "undefined") {
              // Fallback: render as text if not in browser
              doc.setFontSize(12)
              doc.setFont("helvetica", "normal")
              const splitWords = doc.splitTextToSize(amountInWords, 100)
              doc.text(splitWords, 20, numericAmountY)
            } else {
              // Create a canvas element to render Arabic text with VERY LARGE font for readability
              const canvas = document.createElement("canvas")
              const ctx = canvas.getContext("2d")
              if (ctx) {
              // Use very high resolution for crisp text
              const scale = 4
              // Make font size MUCH larger - similar to the numeric amount (16pt ≈ 22px)
              // We want it to be clearly readable, so make it even larger
              const baseFontSize = 100 // VERY large font size for readability
              canvas.width = 2000 * scale
              canvas.height = 300 * scale
              
              // Scale context for high DPI
              ctx.scale(scale, scale)
              
              // Set VERY LARGE font size for Arabic/Kurdish text - bold for better visibility
              ctx.font = `bold ${baseFontSize}px Arial, 'Arabic Typesetting', 'Traditional Arabic', sans-serif`
              ctx.fillStyle = "#000000"
              ctx.textAlign = "right"
              ctx.textBaseline = "middle"
              
              // Split text into lines that fit
              const maxWidth = 1980
              const words = amountInWords.split(" ")
              const lines: string[] = []
              let currentLine = ""
              
              // Build lines from right to left (RTL)
              for (let i = words.length - 1; i >= 0; i--) {
                const testLine = currentLine ? words[i] + " " + currentLine : words[i]
                const metrics = ctx.measureText(testLine)
                if (metrics.width > maxWidth && currentLine) {
                  lines.push(currentLine)
                  currentLine = words[i]
                } else {
                  currentLine = testLine
                }
              }
              if (currentLine) {
                lines.push(currentLine)
              }
              
              // Draw text lines with proper spacing, centered vertically
              const lineHeight = baseFontSize * 1.5
              const totalHeight = lines.length * lineHeight
              const startY = (300 - totalHeight) / 2 + lineHeight / 2
              
              lines.forEach((line, index) => {
                ctx.fillText(line, 1990, startY + index * lineHeight)
              })
              
              // Convert canvas to image and add to PDF with LARGE size
              const imgData = canvas.toDataURL("image/png", 1.0) // Highest quality
              
              // Make the image large enough for readability but ensure it doesn't overlap the numeric amount
              // The numeric amount starts at x=130mm, so we need to keep Arabic text before that
              // Leave at least 5mm gap between Arabic text and numeric amount
              const maxArabicWidth = 130 - 5 - 20 // 130 (numeric x) - 5 (gap) - 20 (start x) = 105mm max
              const imgWidth = Math.min(105, 100) // mm - ensure it doesn't exceed the limit
              // Make height large enough for readability
              const imgHeight = lines.length === 1 ? 10 : Math.min(20, lines.length * 6)
              
              // Position at EXACT same Y level as numeric amount (same line)
              // But ensure it ends before x=125mm to leave space for the numeric amount at x=130mm
              // numericAmountY is the Y position of the numeric amount text
              // We need to center the image vertically at that position
              const imageY = numericAmountY - (imgHeight / 2)
              // Position at x=20, but ensure width doesn't exceed maxArabicWidth
              doc.addImage(imgData, "PNG", 20, imageY, imgWidth, imgHeight)
              } else {
                // Fallback: render as text
                doc.setFontSize(12)
                doc.setFont("helvetica", "normal")
                const splitWords = doc.splitTextToSize(amountInWords, 100)
                doc.text(splitWords, 20, numericAmountY)
              }
            }
          } catch (error) {
            console.error("Error rendering Arabic text:", error)
            // Fallback: render as text
            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            const splitWords = doc.splitTextToSize(amountInWords, 100)
            doc.text(splitWords, 20, numericAmountY)
          }
        } else {
          // For English, render normally next to the amount
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          const splitWords = doc.splitTextToSize(amountInWords, 100)
          doc.text(splitWords, 20, numericAmountY)
        }
      }

      // Notes
      let signatureY = amountY + 30
      if (voucher.notes) {
        const notesY = signatureY + 10
        doc.setFont("helvetica", "bold")
        doc.text("Notes:", 20, notesY)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(voucher.notes, 170)
        doc.text(splitNotes, 20, notesY + 10)
        signatureY = notesY + 20 + (splitNotes.length * 5)
      }

      // Signature section
      const signatureStartY = Math.max(signatureY, 220)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      
      // Delivered By section
      if (voucher.deliveredBy) {
        doc.text(voucher.deliveredBy, 20, signatureStartY)
        // Signature line
        doc.line(20, signatureStartY + 5, 90, signatureStartY + 5)
        doc.setFontSize(8)
        doc.text("Signature", 20, signatureStartY + 10)
        // Date line
        doc.line(20, signatureStartY + 15, 90, signatureStartY + 15)
        doc.text("Date", 20, signatureStartY + 20)
      }
      
      // Received By section
      if (voucher.receivedBy) {
        doc.setFontSize(10)
        doc.text(voucher.receivedBy, 120, signatureStartY)
        // Signature line
        doc.line(120, signatureStartY + 5, 190, signatureStartY + 5)
        doc.setFontSize(8)
        doc.text("Signature", 120, signatureStartY + 10)
        // Date line
        doc.line(120, signatureStartY + 15, 190, signatureStartY + 15)
        doc.text("Date", 120, signatureStartY + 20)
      }

      // Footer
      const footerY = signatureStartY + 30
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Thank you for your payment! For questions, contact us at ${companyInfo.email}`, 20, footerY)

      // Generate PDF blob and trigger print
      try {
        const pdfBlob = doc.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        
        // Create iframe for printing
        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"
        iframe.src = pdfUrl
        document.body.appendChild(iframe)
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.print()
            } catch (error) {
              console.error("Print failed, downloading instead:", error)
              doc.save(`${voucher.voucherNumber}.pdf`)
            }
            // Clean up after a delay
            setTimeout(() => {
              document.body.removeChild(iframe)
              URL.revokeObjectURL(pdfUrl)
            }, 1000)
          }, 500)
        }
      } catch (error) {
        console.error("Auto-print failed, downloading instead:", error)
        // Fallback: download if auto-print fails
        doc.save(`${voucher.voucherNumber}.pdf`)
      }
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
