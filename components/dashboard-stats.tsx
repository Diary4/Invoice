"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, DollarSign, CheckCircle } from "lucide-react"
import { formatCurrency } from "../lib/currency"

interface DashboardStatsProps {
  invoices?: any[]
  customers?: any[]
}

export function DashboardStats({ invoices = [], customers = [] }: DashboardStatsProps) {
  // Calculate stats from the provided data
  const stats = {
    totalCustomers: customers.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
  }

  // Determine the primary currency for revenue display
  const primaryCurrency = invoices.length > 0 ? invoices[0]?.currency || "USD" : "USD"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalCustomers === 1 ? "customer" : "customers"} in database
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          <p className="text-xs text-muted-foreground">{stats.totalInvoices === 1 ? "invoice" : "invoices"} created</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalRevenue > 0 ? formatCurrency(stats.totalRevenue, primaryCurrency) : formatCurrency(0, "USD")}
          </div>
          <p className="text-xs text-muted-foreground">across all invoices</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.paidInvoices}</div>
          <p className="text-xs text-muted-foreground">
            of {stats.totalInvoices} {stats.totalInvoices === 1 ? "invoice" : "invoices"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
