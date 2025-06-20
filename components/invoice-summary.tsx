import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InvoiceSummaryProps {
  customerCount: number
  totalInvoices: number
  totalRevenue: number
}

export function InvoiceSummary({ customerCount, totalInvoices, totalRevenue }: InvoiceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
