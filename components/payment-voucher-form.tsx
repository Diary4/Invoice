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
  const [manualCustomerPhone, setManualCustomerPhone] = useState(
    voucher?.customer?.phone && !voucher?.customerId ? voucher.customer.phone : ""
  )
  const [manualCustomerEmail, setManualCustomerEmail] = useState(
    voucher?.customer?.email && !voucher?.customerId ? voucher.customer.email : ""
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
  const [amountLanguage, setAmountLanguage] = useState<"english" | "arabic" | "kurdish">(
    voucher?.amountLanguage || "english"
  )
  const [paymentMethod, setPaymentMethod] = useState(voucher?.paymentMethod || "")
  const [descriptions, setDescriptions] = useState<DescriptionItem[]>(() => {
    // Handle descriptions from database (could be JSON string or array)
    if (voucher?.descriptions) {
      if (Array.isArray(voucher.descriptions)) {
        if (voucher.descriptions.length > 0) {
          if (typeof voucher.descriptions[0] === 'object' && 'description' in voucher.descriptions[0]) {
            return voucher.descriptions as DescriptionItem[]
          } else {
            return (voucher.descriptions as string[]).map(desc => ({ description: desc, amount: 0 }))
          }
        }
      }
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
    return voucher?.description ? [{ description: voucher.description, amount: 0 }] : [{ description: "", amount: 0 }]
  })
  const [status, setStatus] = useState<PaymentVoucher["status"]>(voucher?.status || "draft")
  const [notes, setNotes] = useState(voucher?.notes || "")
  const [name, setName] = useState(voucher?.name || "")
  const [accountantName, setAccountantName] = useState(voucher?.accountantName || voucher?.accountant_name || "")

  // Calculate total amount from descriptions
  const totalAmount = descriptions.reduce((sum, item) => {
    const itemAmount = typeof item.amount === 'number' ? item.amount : Number(item.amount) || 0
    return sum + itemAmount
  }, 0)

  const addDescription = () => {
    setDescriptions([...descriptions, { description: "", amount: 0 }])
  }

  const removeDescription = (index: number) => {
    if (descriptions.length > 1) {
      setDescriptions(descriptions.filter((_, i) => i !== index))
    }
  }

  const updateDescription = (index: number, field: keyof DescriptionItem, value: string | number) => {
    const newDescriptions = [...descriptions]
    newDescriptions[index] = { ...newDescriptions[index], [field]: value }
    setDescriptions(newDescriptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let selectedCustomer = null
    if (useManualCustomer && manualCustomerName.trim()) {
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
      amountLanguage: amountLanguage,
    }

    await onSave(voucherData)
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
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="manual-customer-name">Name</Label>
                    <Input
                      id="manual-customer-name"
                      placeholder="Customer name"
                      value={manualCustomerName}
                      onChange={(e) => setManualCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <Label>Amount in Words (Language)</Label>
            <RadioGroup
              value={amountLanguage}
              onValueChange={(value: "english" | "arabic" | "kurdish") => setAmountLanguage(value)}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english" id="voucher-english" />
                <Label htmlFor="voucher-english" className="cursor-pointer">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arabic" id="voucher-arabic" />
                <Label htmlFor="voucher-arabic" className="cursor-pointer">Arabic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kurdish" id="voucher-kurdish" />
                <Label htmlFor="voucher-kurdish" className="cursor-pointer">Kurdish</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="name">Prepared By</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name of person preparing"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Payment Descriptions</Label>
              <Button type="button" onClick={addDescription} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Description
              </Button>
            </div>

            <div className="space-y-4">
              {descriptions.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-7">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateDescription(index, "description", e.target.value)}
                      placeholder={`Description ${index + 1}`}
                      required
                    />
                  </div>
                  <div className="col-span-4">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
                        updateDescription(index, "amount", value)
                      }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDescription(index)}
                      disabled={descriptions.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
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