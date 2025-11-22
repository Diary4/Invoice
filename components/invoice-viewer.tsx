"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, FileText } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { Invoice, CompanyInfo } from "../types"

interface InvoiceViewerProps {
  invoice: Invoice
  companyInfo: CompanyInfo
  onEdit: () => void
  onDownloadPDF: () => void
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Button onClick={onDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
                <p className="text-muted-foreground">Invoice Details</p>
              </div>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex items-start gap-4">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain rounded-lg border"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-primary">{companyInfo.name}</h2>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.phone}</p>
                  <p>{companyInfo.email}</p>
                  {companyInfo.website && <p>{companyInfo.website}</p>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-lg font-semibold mt-2 text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoice.customer && (
              <div>
                <h3 className="font-semibold text-primary mb-3">Bill To:</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{invoice.customer.name}</p>
                  <p className="text-muted-foreground">{invoice.customer.email}</p>
                  {invoice.customer.phone && <p className="text-muted-foreground">{invoice.customer.phone}</p>}
                  {invoice.customer.address && <p className="text-muted-foreground">{invoice.customer.address}</p>}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Items & Services</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-center p-4 font-medium">Qty</th>
                    <th className="text-right p-4 font-medium">Price</th>
                    <th className="text-right p-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-muted/25" : "bg-background"}>
                      <td className="p-4">{item.description}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(item.total, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 bg-muted/50 p-6 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-primary mb-3">Notes:</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Thank you for your business!</p>
            <p>For questions about this invoice, please contact us at {companyInfo.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
