"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, Plus, Download, Search, X } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { ReceiptVoucher } from "../types"
import { useState, useMemo } from "react"

interface ReceiptVoucherListProps {
  vouchers: ReceiptVoucher[]
  onViewVoucher: (id: string) => void
  onEditVoucher: (id: string) => void
  onDeleteVoucher: (id: string) => void
  onDownloadPDF: (voucher: ReceiptVoucher) => void
  onCreateVoucher?: () => void
}

export function ReceiptVoucherList({
  vouchers,
  onViewVoucher,
  onEditVoucher,
  onDeleteVoucher,
  onDownloadPDF,
  onCreateVoucher,
}: ReceiptVoucherListProps) {
  const [searchVoucherNumber, setSearchVoucherNumber] = useState("")
  const [searchCustomerName, setSearchCustomerName] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")

  const getStatusColor = (status: ReceiptVoucher["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get unique months from receipt date
  const availableMonths = useMemo(() => {
    const months = new Map()
    
    vouchers.forEach(voucher => {
      if (voucher.receiptDate) {
        const date = new Date(voucher.receiptDate)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = date.getMonth()
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ]
          const displayName = `${monthNames[month]} ${year}`
          months.set(monthKey, displayName)
        }
      }
    })
    
    return Array.from(months.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value))
  }, [vouchers])

  // Get unique payment methods
  const availablePaymentMethods = useMemo(() => {
    const methods = new Set<string>()
    vouchers.forEach(voucher => {
      if (voucher.paymentMethod) {
        methods.add(voucher.paymentMethod)
      }
    })
    return Array.from(methods).sort()
  }, [vouchers])

  // Filter vouchers based on search and filters
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      // Search by voucher number
      const matchesVoucherNumber = searchVoucherNumber === "" || 
        voucher.voucherNumber.toLowerCase().includes(searchVoucherNumber.toLowerCase())

      // Search by customer name
      const matchesCustomerName = searchCustomerName === "" || 
        voucher.customer?.name?.toLowerCase().includes(searchCustomerName.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || voucher.status === statusFilter

      // Payment method filter
      const matchesPaymentMethod = paymentMethodFilter === "all" || 
        voucher.paymentMethod === paymentMethodFilter

      // Month filter
      let matchesMonth = true
      if (monthFilter !== "all" && voucher.receiptDate) {
        const date = new Date(voucher.receiptDate)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const monthKey = `${year}-${String(month).padStart(2, '0')}`
          matchesMonth = monthKey === monthFilter
        } else {
          matchesMonth = false
        }
      }

      return matchesVoucherNumber && matchesCustomerName && matchesStatus && 
             matchesPaymentMethod && matchesMonth
    })
  }, [vouchers, searchVoucherNumber, searchCustomerName, statusFilter, paymentMethodFilter, monthFilter])

  const clearFilters = () => {
    setSearchVoucherNumber("")
    setSearchCustomerName("")
    setStatusFilter("all")
    setPaymentMethodFilter("all")
    setMonthFilter("all")
  }

  const hasActiveFilters = searchVoucherNumber || searchCustomerName || 
    statusFilter !== "all" || paymentMethodFilter !== "all" || monthFilter !== "all"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Receipt Vouchers ({filteredVouchers.length})</CardTitle>
          {onCreateVoucher && (
            <Button onClick={onCreateVoucher} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Receipt Voucher
            </Button>
          )}
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="voucher-number">Voucher Number</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="voucher-number"
                placeholder="Search by voucher #..."
                value={searchVoucherNumber}
                onChange={(e) => setSearchVoucherNumber(e.target.value)}
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {availablePaymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
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
        {filteredVouchers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {vouchers.length === 0 
                ? "No receipt vouchers yet. Create your first voucher!" 
                : "No vouchers match your filters"}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVouchers.map((voucher) => (
              <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{voucher.voucherNumber}</h3>
                    <Badge className={getStatusColor(voucher.status)}>{voucher.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{voucher.customer?.name || "No customer"}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(voucher.receiptDate).toLocaleDateString()}
                    {voucher.paymentMethod && ` • Method: ${voucher.paymentMethod.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}`}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold">{formatCurrency(voucher.amount, voucher.currency)}</p>
                  {voucher.referenceNumber && (
                    <p className="text-sm text-muted-foreground">Ref: {voucher.referenceNumber}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewVoucher(voucher.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditVoucher(voucher.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownloadPDF(voucher)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDeleteVoucher(voucher.id)}>
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