"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatCurrency, type Currency } from "@/lib/currency"

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  customer_email: string
  issue_date: string
  due_date: string
  currency: Currency
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  created_at: string
}

interface InvoiceListProps {
  onViewInvoice: (id: number) => void
}

export function InvoiceList({ onViewInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
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

  const updateInvoiceStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchInvoices() // Refresh the list
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading invoices...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Manage your invoices and track payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{invoice.invoice_number}</h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Customer:</strong> {invoice.customer_name}
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatCurrency(invoice.total, invoice.currency)}
                    </p>
                    <p>
                      <strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(invoice.id, "sent")}>
                      Send
                    </Button>
                  )}
                  {invoice.status === "sent" && (
                    <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(invoice.id, "paid")}>
                      Mark Paid
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onViewInvoice(invoice.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
