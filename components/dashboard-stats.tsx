import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer, Invoice } from "../types"

interface DashboardStatsProps {
  customers: Customer[]
  invoices: Invoice[]
}

export function DashboardStats({ customers, invoices }: DashboardStatsProps) {
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid")
  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const pendingRevenue = totalRevenue - paidRevenue

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoices.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${paidRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">${pendingRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
