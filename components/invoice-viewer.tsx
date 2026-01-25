"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Edit, FileText } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import { numberToWords } from "../lib/number-to-words"
import type { Invoice, CompanyInfo } from "../types"

interface InvoiceViewerProps {
  invoice: Invoice
  companyInfo: CompanyInfo
  onEdit: () => void
  onDownloadPDF?: () => void
  onBack: () => void
}

export function InvoiceViewer({ invoice, companyInfo, onEdit, onDownloadPDF, onBack }: InvoiceViewerProps) {
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Card - Made more compact */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{invoice.invoiceNumber}</CardTitle>
                <p className="text-sm text-muted-foreground">Invoice Details</p>
              </div>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company Header - Compact */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-start gap-3">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h2 className="text-lg font-bold text-primary">{companyInfo.name}</h2>
                <div className="text-xs text-muted-foreground mt-1">
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.phone}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-sm font-semibold mt-1 text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Invoice Details - Inline compact */}
          <div className="flex justify-between gap-4">
            {invoice.customer && (
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-sm text-primary">Bill To: </h3>
                  <p className="font-semibold text-sm ml-1">{invoice.customer.name}</p>
                </div>
                {invoice.customer.phone && (
                  <p className="text-xs text-muted-foreground mt-1">Phone: {invoice.customer.phone}</p>
                )}
              </div>
            )}
            <div className="space-y-2 justify-end">
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground">Issue Date:</span>
                <span className="text-sm font-medium ml-1">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground">Due Date:</span>
                <span className="text-sm font-medium ml-1">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground">Currency:</span>
                <span className="text-sm font-medium ml-1">{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Items Table - More compact */}
          <div>
            <h3 className="font-semibold text-sm text-primary mb-2">Items & Services</h3>
            <div className="border rounded overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="text-left p-2 font-medium">NO.</th>
                    <th className="text-left p-2 font-medium">DESCRIPTION OF GOODS</th>
                    <th className="text-center p-2 font-medium">pallet</th>
                    <th className="text-center p-2 font-medium">pcs</th>
                    <th className="text-center p-2 font-medium">total - PCS</th>
                    <th className="text-right p-2 font-medium">UNIT PRICE</th>
                    <th className="text-right p-2 font-medium">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const totalQuantity = (item.quantity || 0) * (item.pallet || 0)
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-muted/25" : "bg-background"}>
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.pallet || 0}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-center font-medium">{totalQuantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.total, invoice.currency)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals - Compact */}
          <div className="flex justify-end">
            <div className="w-64 bg-muted/50 p-4 rounded">
              <div className="space-y-2">
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL:</span>
                    <span className="text-primary">{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                </div>
                {/* Amount in Words */}
                {(() => {
                  const amountLanguage = (invoice as any).amountLanguage || (invoice as any).amount_language
                  return amountLanguage ? (
                    <div className="border-t pt-2">
                      <p className="font-medium text-xs" dir={amountLanguage === "arabic" || amountLanguage === "kurdish" ? "rtl" : "ltr"}>
                        {numberToWords(invoice.total, amountLanguage as "english" | "arabic" | "kurdish", invoice.currency)}
                      </p>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </div>

          {/* Warranty/Notes Section - Compact */}
          <div className="border-t pt-4">
            <div className="bg-muted/50 p-3 rounded">
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>Attached serial number with invoice</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>تحمل الشركة المجهزة الضمانات الموجود في العرض .</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>( لا يشمل الضمان الكسر او التلف او التركيب الخاطيء )</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>Ronma panel 15 years warranty</span>
                </li>
                {/* Additional notes from invoice.notes */}
                {invoice.notes && (
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{invoice.notes}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Footer - Compact */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p className="mb-1">Thank you for your business!</p>
            <p>For questions about this invoice, please contact us at {companyInfo.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}