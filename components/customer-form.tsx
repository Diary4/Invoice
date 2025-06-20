"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer } from "../types/customer"

interface CustomerFormProps {
  onAddCustomer: (customer: Omit<Customer, "id">) => void
  onReset: () => void
}

export function CustomerForm({ onAddCustomer, onReset }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      onAddCustomer(formData)
      setFormData({ name: "", email: "", phone: "", address: "" })
    }
  }

  const handleReset = () => {
    setFormData({ name: "", email: "", phone: "", address: "" })
    onReset()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Add Customer
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset All to 0
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
