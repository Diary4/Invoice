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
import type { Customer, PaymentVoucher, DescriptionItem } from "../types"
import { formatCurrency } from "@/lib/currency"

interface PaymentVoucherFormProps {
  customers: Customer[]
  voucher?: PaymentVoucher
  onSave: (voucher: Omit<PaymentVoucher, "id" | "voucherNumber" | "createdAt">) => void
  onCancel: () => void
}

export function PaymentVoucherForm({ customers, voucher, onSave, onCancel }: PaymentVoucherFormProps) {
  const [customerId, setCustomerId] = useState(voucher?.customerId || "__none__")
  const [useManualCustomer, setUseManualCustomer] = useState(
    voucher?.customer?.name && !voucher?.customerId ? true : false
  )
  const [manualCustomerName, setManualCustomerName] = useState(
    voucher?.customer?.name && !voucher?.customerId ? voucher.customer.name : ""
  )
  
  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    if (value !== "__manual__") {
      setUseManualCustomer(false)
    }
  }
  const [paymentDate, setPaymentDate] = useState(
    voucher?.paymentDate ? new Date(voucher.paymentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [currency, setCurrency] = useState<"USD" | "IQD">(voucher?.currency || "IQD")
  const [paymentMethod, setPaymentMethod] = useState(voucher?.paymentMethod || "")
  const [descriptions, setDescriptions] = useState<DescriptionItem[]>(() => {
    // Handle descriptions from database (could be JSON string or array)
    if (voucher?.descriptions) {
      if (Array.isArray(voucher.descriptions)) {
        // Check if it's already DescriptionItem[] or string[]
        if (voucher.descriptions.length > 0) {
          if (typeof voucher.descriptions[0] === 'object' && 'description' in voucher.descriptions[0]) {
            return voucher.descriptions as DescriptionItem[]
          } else {
            // Convert string[] to DescriptionItem[]
            return (voucher.descriptions as string[]).map(desc => ({ description: desc, amount: 0 }))
          }
        }
      }
      // If it's a string, try to parse it
      try {
        const parsed = typeof voucher.descriptions === 'string' ? JSON.parse(voucher.descriptions) : voucher.descriptions
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'object' && 'description' in parsed[0]) {
            return parsed as DescriptionItem[]
          } else {
            return (parsed as string[]).map(desc => ({ description: desc, amount: 0 }))
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    // Fallback to single description
    return voucher?.description ? [{ description: voucher.description, amount: 0 }] : [{ description: "", amount: "" }]
  })
  const [status, setStatus] = useState<PaymentVoucher["status"]>(voucher?.status || "draft")
  const [notes, setNotes] = useState(voucher?.notes || "")
  const [name, setName] = useState(voucher?.name || voucher?.name || "")
  const [accountantName, setAccountantName] = useState(voucher?.accountantName || voucher?.accountant_name || "")

  // Calculate total amount from descriptions
  const totalAmount = descriptions.reduce((sum, item) => {
    const itemAmount = typeof item.amount === 'number' ? item.amount : (item.amount === '' || item.amount === null || item.amount === undefined ? 0 : Number.parseFloat(String(item.amount)) || 0)
    return sum + itemAmount
  }, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let selectedCustomer = null
    if (useManualCustomer && manualCustomerName.trim()) {
      // Create a temporary customer object for manual entry
      selectedCustomer = {
        id: "__manual__",
        name: manualCustomerName.trim(),
        email: "",
        phone: "",
        address: "",
        createdAt: new Date(),
      }
    } else if (customerId && customerId !== "__none__" && customerId !== "__manual__") {
      selectedCustomer = customers.find((c) => c.id === customerId) || null
    }

    // Auto-generate reference number
    const referenceNumber = voucher?.voucherNumber 
      ? `REF-${voucher.voucherNumber}` 
      : `REF-${Date.now()}`

    const voucherData = {
      customerId: useManualCustomer ? null : (customerId && customerId !== "__none__" && customerId !== "__manual__" ? customerId : null),
      customer: selectedCustomer || undefined,
      paymentDate: new Date(paymentDate),
      currency,
      amount: totalAmount,
      paymentMethod: paymentMethod || undefined,
      referenceNumber: referenceNumber,
      descriptions: descriptions.filter((item) => item.description.trim() !== ""),
      status,
      notes: notes || undefined,
      name: name || undefined,
      accountantName: accountantName || undefined,
    }

    onSave(voucherData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{voucher ? "Edit Payment Voucher" : "Create Payment Voucher"}</CardTitle>
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
                <Input
                  placeholder="Enter customer name"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: PaymentVoucher["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Descriptions</Label>
              <Button type="button" onClick={() => setDescriptions([...descriptions, { description: "", amount: "" }])} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Description
              </Button>
            </div>
            <div className="space-y-2">
              {descriptions.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const newDescriptions = [...descriptions]
                      newDescriptions[index] = { ...newDescriptions[index], description: e.target.value }
                      setDescriptions(newDescriptions)
                    }}
                    placeholder={`Description ${index + 1}...`}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount === "" ? "" : item.amount}
                    onChange={(e) => {
                      const newDescriptions = [...descriptions]
                      const value = e.target.value === "" ? "" : (Number.parseFloat(e.target.value) || 0)
                      newDescriptions[index] = { ...newDescriptions[index], amount: value }
                      setDescriptions(newDescriptions)
                    }}
                    placeholder="Amount"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (descriptions.length > 1) {
                        setDescriptions(descriptions.filter((_, i) => i !== index))
                      }
                    }}
                    disabled={descriptions.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div>
              <Label htmlFor="accountantName">Accountant Name</Label>
              <Input
                id="accountantName"
                value={accountantName}
                onChange={(e) => setAccountantName(e.target.value)}
                placeholder="Accountant name"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{voucher ? "Update Voucher" : "Create Voucher"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

