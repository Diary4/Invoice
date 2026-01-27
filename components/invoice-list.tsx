"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Plus, Download } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { Invoice } from "../types"

interface InvoiceListProps {
  invoices: Invoice[]
  onViewInvoice: (id: string) => void
  onEditInvoice: (id: string) => void
  onDeleteInvoice: (id: string) => void
}

export function InvoiceList({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
}: InvoiceListProps) {
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoices ({invoices.length})</CardTitle>
          <Button onClick={() => onViewInvoice && onViewInvoice("")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No invoices yet. Create your first invoice!</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.customer?.name || "No customer"}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                    {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.items.length} items</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewInvoice(invoice.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditInvoice(invoice.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
.                  <Button size="sm" variant="outline" onClick={() => onDeleteInvoice(invoice.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
