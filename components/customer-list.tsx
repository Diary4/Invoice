import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer } from "../types/customer"

interface CustomerListProps {
  customers: Customer[]
}

export function CustomerList({ customers }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customers added yet. All values are set to 0.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer List ({customers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
              {customer.address && <p className="text-sm text-muted-foreground">{customer.address}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
