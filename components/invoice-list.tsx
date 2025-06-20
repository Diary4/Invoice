"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Plus, Download } from "lucide-react"
import type { Invoice } from "../types"

interface InvoiceListProps {
  invoices: Invoice[]
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
  onDownloadPDF: (invoice: Invoice) => void
}

export function InvoiceList({ invoices, onView, onEdit, onDelete, onCreateNew, onDownloadPDF }: InvoiceListProps) {
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoices ({invoices.length})</CardTitle>
          <Button onClick={onCreateNew} size="sm">
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
                  <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                    {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold">${invoice.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.items.length} items</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(invoice)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(invoice)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownloadPDF(invoice)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(invoice.id)}>
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
