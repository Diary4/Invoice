"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Customer, Invoice, InvoiceItem } from "../types"

interface InvoiceFormProps {
  customers: Customer[]
  invoice?: Invoice
  onSave: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => void
  onCancel: () => void
}

export function InvoiceForm({ customers, invoice, onSave, onCancel }: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState(invoice?.customerId || "")
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || [])
  const [taxRate, setTaxRate] = useState(invoice?.taxRate || 10)
  const [status, setStatus] = useState<Invoice["status"]>(invoice?.status || "draft")
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "")
  const [notes, setNotes] = useState(invoice?.notes || "")

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "price") {
            updatedItem.total = updatedItem.quantity * updatedItem.price
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId || items.length === 0) return

    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return

    onSave({
      customerId,
      customerName: customer.name,
      items,
      subtotal,
      tax,
      taxRate,
      total,
      status,
      dueDate,
      notes,
    })
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
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
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

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input value={`$${item.total.toFixed(2)}`} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!customerId || items.length === 0}>
              {invoice ? "Update" : "Create"} Invoice
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
