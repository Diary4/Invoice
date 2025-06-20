"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Download } from "lucide-react"
import type { Invoice, Customer, CompanyInfo } from "../types"

interface InvoiceViewerProps {
  invoice: Invoice
  customer: Customer | undefined
  companyInfo: CompanyInfo
  onClose: () => void
  onEdit: () => void
  onDownloadPDF: () => void
}

export function InvoiceViewer({ invoice, customer, companyInfo, onClose, onEdit, onDownloadPDF }: InvoiceViewerProps) {
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle>Invoice {invoice.invoiceNumber}</CardTitle>
            <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={onDownloadPDF} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onEdit} size="sm">
              Edit Invoice
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="flex items-start gap-4">
            {companyInfo.logo && (
              <img
                src={companyInfo.logo || "/placeholder.svg"}
                alt="Company Logo"
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">{companyInfo.name}</h2>
              <div className="text-sm text-muted-foreground mt-1">
                <p>{companyInfo.address}</p>
                <p>
                  {companyInfo.city}, {companyInfo.state} {companyInfo.zipCode}
                </p>
                <p>Phone: {companyInfo.phone}</p>
                <p>Email: {companyInfo.email}</p>
                {companyInfo.website && <p>Website: {companyInfo.website}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2 text-primary">Bill To:</h3>
            <div className="text-sm bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-lg">{customer?.name}</p>
              <p>{customer?.email}</p>
              {customer?.phone && <p>{customer.phone}</p>}
              {customer?.address && <p>{customer.address}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Date:</span>
                <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Due Date:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <h3 className="font-semibold mb-4 text-primary">Items & Services</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-right p-4 font-medium">Qty</th>
                  <th className="text-right p-4 font-medium">Rate</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-4">{item.description}</td>
                    <td className="p-4 text-right">{item.quantity}</td>
                    <td className="p-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Totals */}
        <div className="flex justify-end">
          <div className="w-80 bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span className="text-primary">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2 text-primary">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, please contact {companyInfo.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
