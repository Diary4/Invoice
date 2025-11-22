"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus } from "lucide-react"
import type { Customer, Invoice, InvoiceItem } from "../types"

interface InvoiceFormProps {
  customers: Customer[]
  invoice?: Invoice
  onSave: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => void
  onCancel: () => void
}

function formatCurrency(amount: number, currency: "USD" | "IQD") {
  return currency === "USD" ? `$${amount.toFixed(2)}` : `د.ع ${amount.toFixed(2)}`
}

export function InvoiceForm({ customers, invoice, onSave, onCancel }: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState(invoice?.customerId || "__none__")
  
  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
  }
  const [items, setItems] = useState<Omit<InvoiceItem, "id">[]>(
    invoice?.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })) || [{ description: "", quantity: 1, price: 0, total: 0 }],
  )
  const [status, setStatus] = useState<Invoice["status"]>(invoice?.status || "draft")
  const [issueDate, setIssueDate] = useState(
    invoice?.issueDate.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
  )
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate.toISOString().split("T")[0] ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [notes, setNotes] = useState(invoice?.notes || "")
  const [currency, setCurrency] = useState<"USD" | "IQD">(invoice?.currency || "IQD")

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, "id">, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "quantity" || field === "price") {
      newItems[index].total = newItems[index].quantity * newItems[index].price
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedCustomer = customerId && customerId !== "__none__" ? customers.find((c) => c.id === customerId) : null

    const invoiceData = {
      customerId: customerId && customerId !== "__none__" ? customerId : null,
      customer: selectedCustomer || undefined,
      items: items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
      })),
      subtotal,
      total,
      status,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      notes: notes || undefined,
      currency,
    }

    onSave(invoiceData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: Invoice["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(value: "USD" | "IQD") => setCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="IQD">Iraqi Dinar (د.ع)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Invoice Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input value={formatCurrency(item.total, currency)} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or terms..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{invoice ? "Update Invoice" : "Create Invoice"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
