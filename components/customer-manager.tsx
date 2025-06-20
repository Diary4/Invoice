"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, Plus } from "lucide-react"
import type { Customer } from "../types"

interface CustomerManagerProps {
  customers: Customer[]
  onAddCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => void
  onDeleteCustomer: (id: string) => void
}

export function CustomerManager({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "" })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      if (editingId) {
        onUpdateCustomer(editingId, formData)
      } else {
        onAddCustomer(formData)
      }
      resetForm()
    }
  }

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
    setEditingId(customer.id)
    setIsAdding(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Customers ({customers.length})</CardTitle>
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update" : "Add"} Customer</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No customers yet. Add your first customer!</p>
          ) : (
            customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDeleteCustomer(customer.id)}>
                    <Trash2 className="w-4 h-4" />
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
