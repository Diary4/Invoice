"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  const [useManualCustomer, setUseManualCustomer] = useState(
    invoice?.customer?.name && !invoice?.customerId ? true : false
  )
  const [manualCustomerName, setManualCustomerName] = useState(
    invoice?.customer?.name && !invoice?.customerId ? invoice.customer.name : ""
  )
  const [manualCustomerPhone, setManualCustomerPhone] = useState(
    invoice?.customer?.phone && !invoice?.customerId ? invoice.customer.phone : ""
  )
  const [manualCustomerEmail, setManualCustomerEmail] = useState(
    invoice?.customer?.email && !invoice?.customerId ? invoice.customer.email : ""
  )
  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    if (value !== "__manual__") {
      setUseManualCustomer(false)
    }
  }
  const [items, setItems] = useState<Omit<InvoiceItem, "id">[]>(
    invoice?.items.map((item) => {
      const quantity = item.quantity || 0
      const pallet = item.pallet || 0
      const price = item.price || 0
      const totalQuantity = quantity * pallet
      const total = totalQuantity * price
      return {
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: total, // Recalculate based on quantity * pallet * price
        pallet: item.pallet || 0,
      }
    }) || [{ description: "", quantity: 1, price: 0, total: 0, pallet: 1 }],
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
  const [amountLanguage, setAmountLanguage] = useState<"english" | "arabic" | "kurdish">(
    invoice?.amountLanguage || "english"
  )
  const [paidAmount, setPaidAmount] = useState<number>(invoice?.paidAmount || 0)
  const [branch, setBranch] = useState<string>(invoice?.branch || "")

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, "id">, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Calculate total: (quantity * pallet) * price
    if (field === "quantity" || field === "price" || field === "pallet") {
      const quantity = newItems[index].quantity || 0
      const pallet = newItems[index].pallet || 0
      const price = newItems[index].price || 0
      const totalQuantity = quantity * pallet
      newItems[index].total = totalQuantity * price
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, total: 0, pallet: 1 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let selectedCustomer = null
    if (useManualCustomer && manualCustomerName.trim()) {
      // Create a temporary customer object for manual entry
      selectedCustomer = {
        id: "__manual__",
        name: manualCustomerName.trim(),
        email: manualCustomerEmail.trim() || "",
        phone: manualCustomerPhone.trim() || "",
        address: "",
        createdAt: new Date(),
      }
    } else if (customerId && customerId !== "__none__" && customerId !== "__manual__") {
      selectedCustomer = customers.find((c) => c.id === customerId) || null
    }

    // Auto-determine status based on paid amount
    let finalStatus = status
    if (paidAmount >= total && total > 0) {
      finalStatus = "paid"
    } else if (paidAmount > 0 && paidAmount < total) {
      finalStatus = "partially_paid"
    } else if (paidAmount === 0 && (status === "paid" || status === "partially_paid")) {
      finalStatus = "sent"
    }

    const invoiceData = {
      customerId: useManualCustomer ? null : (customerId && customerId !== "__none__" && customerId !== "__manual__" ? customerId : null),
      customer: selectedCustomer || undefined,
      items: items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
      })),
      subtotal,
      total,
      paidAmount: paidAmount || 0,
      status: finalStatus,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      branch: branch.trim() || undefined,
      notes: notes || undefined,
      currency,
      amountLanguage,
    }

    try {
      await onSave(invoiceData)
    } catch (error) {
      // Error is already handled in invoice-system.tsx, but we can add additional handling here if needed
      console.error("Error in invoice form submit:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={useManualCustomer ? "__manual__" : customerId} 
                onValueChange={(value) => {
                  if (value === "__manual__") {
                    setUseManualCustomer(true)
                    setCustomerId("__none__")
                  } else {
                    setUseManualCustomer(false)
                    handleCustomerChange(value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  <SelectItem value="__manual__">Enter Manually</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {useManualCustomer && (
                <div className="space-y-3 mt-2 col-span-2">
                  <div>
                    <Label htmlFor="manual-customer-name">Name</Label>
                    <Input
                      id="manual-customer-name"
                      placeholder="Customer name"
                      value={manualCustomerName}
                      onChange={(e) => setManualCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="manual-customer-phone">Phone</Label>
                      <Input
                        id="manual-customer-phone"
                        placeholder="Phone number"
                        value={manualCustomerPhone}
                        onChange={(e) => setManualCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-customer-email">Email</Label>
                      <Input
                        id="manual-customer-email"
                        type="email"
                        placeholder="Email address"
                        value={manualCustomerEmail}
                        onChange={(e) => setManualCustomerEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
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

          <div>
            <Label>Amount in Words (Language)</Label>
            <RadioGroup
              value={amountLanguage}
              onValueChange={(value: "english" | "arabic" | "kurdish") => setAmountLanguage(value)}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english" id="invoice-english" />
                <Label htmlFor="invoice-english" className="cursor-pointer">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arabic" id="invoice-arabic" />
                <Label htmlFor="invoice-arabic" className="cursor-pointer">Arabic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kurdish" id="invoice-kurdish" />
                <Label htmlFor="invoice-kurdish" className="cursor-pointer">Kurdish</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="Branch / location"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
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

            <div className="space-y-4">
              {items.map((item, index) => {
                const totalQuantity = (item.quantity || 0) * (item.pallet || 0)
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Qty/Pallet</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  <div className="col-span-1">
                    <Label>Pallet</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.pallet || 0}
                      onChange={(e) => updateItem(index, "pallet", Number.parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                    <div className="col-span-1">
                      <Label>Total Qty</Label>
                      <Input value={totalQuantity} disabled className="bg-muted" />
                    </div>
                    <div className="col-span-2">
                      <Label>Price/Item</Label>
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
                )
              })}
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
              <div className="flex justify-between border-t pt-2">
                <Label htmlFor="paidAmount" className="text-sm">Paid Amount:</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  max={total}
                  value={paidAmount}
                  onChange={(e) => {
                    const newPaidAmount = Number.parseFloat(e.target.value) || 0
                    setPaidAmount(newPaidAmount)
                    // Auto-update status based on paid amount
                    if (newPaidAmount >= total) {
                      setStatus("paid")
                    } else if (newPaidAmount > 0) {
                      setStatus("partially_paid")
                    } else if (status === "paid" || status === "partially_paid") {
                      setStatus("sent")
                    }
                  }}
                  className="w-32 text-right"
                />
              </div>
              {paidAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Remaining:</span>
                  <span>{formatCurrency(total - paidAmount, currency)}</span>
                </div>
              )}
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
