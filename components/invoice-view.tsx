"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send } from "lucide-react"
import { formatCurrency, type Currency } from "@/lib/currency"
import { COMPANY_INFO } from "@/lib/company"

interface InvoiceViewProps {
  invoiceId: number
  onBack: () => void
}

interface InvoiceData {
  id: number
  invoice_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  issue_date: string
  due_date: string
  currency: Currency
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  status: string
  notes: string
  items: Array<{
    id: number
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

export function InvoiceView({ invoiceId, onBack }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      const data = await response.json()
      setInvoice(data)
    } catch (error) {
      console.error("Error fetching invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              {COMPANY_INFO.logo && (
                <img
                  src={COMPANY_INFO.logo || "/placeholder.svg"}
                  alt={`${COMPANY_INFO.name} Logo`}
                  className="h-16 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-blue-600 mb-1">{COMPANY_INFO.name}</h1>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="whitespace-pre-line">{COMPANY_INFO.address}</p>
                  <p>Phone: {COMPANY_INFO.phone}</p>
                  <p>Email: {COMPANY_INFO.email}</p>
                  {COMPANY_INFO.website && <p>Website: {COMPANY_INFO.website}</p>}
                  {COMPANY_INFO.taxId && <p>Tax ID: {COMPANY_INFO.taxId}</p>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <CardTitle className="text-2xl mb-2">INVOICE</CardTitle>
              <p className="text-lg font-semibold mb-2">{invoice.invoice_number}</p>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{invoice.customer_name}</p>
                {invoice.customer_email && <p>{invoice.customer_email}</p>}
                {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                {invoice.customer_address && <p className="whitespace-pre-line">{invoice.customer_address}</p>}
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currency:</span>
                  <span>{invoice.currency}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.unit_price, invoice.currency)}</td>
                      <td className="text-right py-3">{formatCurrency(item.total, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({invoice.tax_rate}%):</span>
                  <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
