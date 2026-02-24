"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, Plus, Download, Search, X } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { Invoice } from "../types"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useState, useMemo } from "react"

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
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("")
  const [searchCustomerName, setSearchCustomerName] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")

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

  // Get unique months from invoices for the month filter
  const availableMonths = useMemo(() => {
    const months = new Map() // Using Map to ensure unique values
    
    invoices.forEach(invoice => {
      // Parse the date safely
      let date: Date;
      
      if (invoice.createdAt) {
        // Handle different date formats
        if (typeof invoice.createdAt === 'string') {
          // Check if it's a timestamp or date string
          if (invoice.createdAt.includes('T') || invoice.createdAt.includes('-')) {
            date = new Date(invoice.createdAt);
          } else {
            // Try parsing as timestamp
            date = new Date(parseInt(invoice.createdAt));
          }
        } else if (invoice.createdAt instanceof Date) {
          date = invoice.createdAt;
        } else {
          // If it's a timestamp number
          date = new Date(invoice.createdAt);
        }
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-11
          
          // Create a unique key for the month
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
          
          // Create display name
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const displayName = `${monthNames[month]} ${year}`;
          
          months.set(monthKey, displayName);
        } else {
          console.warn('Invalid date found:', invoice.createdAt);
        }
      }
    });
    
    // Convert Map to array and sort by date (newest first)
    return Array.from(months.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value)); // Sort descending by year-month
  }, [invoices]);

  // For debugging - log the available months
  console.log('Available months:', availableMonths);
  console.log('All invoices:', invoices.map(inv => ({
    id: inv.id,
    createdAt: inv.createdAt,
    parsedDate: new Date(inv.createdAt).toString()
  })));

  // Filter invoices based on search and filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Search by invoice number
      const matchesInvoiceNumber = searchInvoiceNumber === "" || 
        invoice.invoiceNumber.toLowerCase().includes(searchInvoiceNumber.toLowerCase())

      // Search by customer name
      const matchesCustomerName = searchCustomerName === "" || 
        invoice.customer?.name?.toLowerCase().includes(searchCustomerName.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      // Month filter
      let matchesMonth = true
      if (monthFilter !== "all") {
        let invoiceDate: Date;
        
        if (typeof invoice.createdAt === 'string') {
          if (invoice.createdAt.includes('T') || invoice.createdAt.includes('-')) {
            invoiceDate = new Date(invoice.createdAt);
          } else {
            invoiceDate = new Date(parseInt(invoice.createdAt));
          }
        } else if (invoice.createdAt instanceof Date) {
          invoiceDate = invoice.createdAt;
        } else {
          invoiceDate = new Date(invoice.createdAt);
        }
        
        if (!isNaN(invoiceDate.getTime())) {
          const invoiceYear = invoiceDate.getFullYear();
          const invoiceMonth = invoiceDate.getMonth() + 1; // 1-12
          const invoiceMonthKey = `${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`;
          matchesMonth = invoiceMonthKey === monthFilter;
        } else {
          matchesMonth = false;
        }
      }

      return matchesInvoiceNumber && matchesCustomerName && matchesStatus && matchesMonth
    })
  }, [invoices, searchInvoiceNumber, searchCustomerName, statusFilter, monthFilter])

  const clearFilters = () => {
    setSearchInvoiceNumber("")
    setSearchCustomerName("")
    setStatusFilter("all")
    setMonthFilter("all")
  }

  const hasActiveFilters = searchInvoiceNumber || searchCustomerName || statusFilter !== "all" || monthFilter !== "all"

  // ✅ Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Invoice Number",
      "Customer",
      "Status",
      "Created At",
      "Due Date",
      "Total",
      "Currency",
      "Items Count",
    ]

    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.customer?.name || "No customer",
      invoice.status,
      new Date(invoice.createdAt).toLocaleDateString(),
      invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "",
      invoice.total,
      invoice.currency,
      invoice.items.length,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "invoices.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.text("Invoice List", 14, 15)

    const tableData = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.customer?.name || "No customer",
      invoice.status,
      new Date(invoice.createdAt).toLocaleDateString(),
      invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "",
      formatCurrency(invoice.total, invoice.currency),
    ])

    autoTable(doc, {
      startY: 20,
      head: [["Number", "Customer", "Status", "Created", "Due", "Total"]],
      body: tableData,
    })

    doc.save("invoices.pdf")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button size="sm" variant="outline" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={() => onViewInvoice("")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="invoice-number"
                placeholder="Search by invoice #..."
                value={searchInvoiceNumber}
                onChange={(e) => setSearchInvoiceNumber(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-name"
                placeholder="Search by customer..."
                value={searchCustomerName}
                onChange={(e) => setSearchCustomerName(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.length > 0 ? (
                  availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No months available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {invoices.length === 0 
                ? "No invoices yet. Create your first invoice!" 
                : "No invoices match your filters"}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
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
                  <Button size="sm" variant="outline" onClick={() => onDeleteInvoice(invoice.id)}>
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