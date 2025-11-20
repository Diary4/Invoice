"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Customer, ReceiptVoucher } from "../types"
import { formatCurrency } from "@/lib/currency"

interface ReceiptVoucherFormProps {
  customers: Customer[]
  voucher?: ReceiptVoucher
  onSave: (voucher: Omit<ReceiptVoucher, "id" | "voucherNumber" | "createdAt">) => void
  onCancel: () => void
}

export function ReceiptVoucherForm({ customers, voucher, onSave, onCancel }: ReceiptVoucherFormProps) {
  const [customerId, setCustomerId] = useState(voucher?.customerId || "")
  const [receiptDate, setReceiptDate] = useState(
    voucher?.receiptDate ? new Date(voucher.receiptDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [currency, setCurrency] = useState<"USD" | "IQD">(voucher?.currency || "USD")
  const [amount, setAmount] = useState(voucher?.amount || 0)
  const [paymentMethod, setPaymentMethod] = useState(voucher?.paymentMethod || "")
  const [referenceNumber, setReferenceNumber] = useState(voucher?.referenceNumber || "")
  const [description, setDescription] = useState(voucher?.description || "")
  const [status, setStatus] = useState<ReceiptVoucher["status"]>(voucher?.status || "draft")
  const [notes, setNotes] = useState(voucher?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedCustomer = customers.find((c) => c.id === customerId)
    if (!selectedCustomer) return

    const voucherData = {
      customerId,
      customer: selectedCustomer,
      receiptDate: new Date(receiptDate),
      currency,
      amount,
      paymentMethod: paymentMethod || undefined,
      referenceNumber: referenceNumber || undefined,
      description: description || undefined,
      status,
      notes: notes || undefined,
    }

    onSave(voucherData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{voucher ? "Edit Receipt Voucher" : "Create Receipt Voucher"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId} required>
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
              <Select value={status} onValueChange={(value: ReceiptVoucher["status"]) => setStatus(value)}>
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
              <Label htmlFor="receiptDate">Receipt Date *</Label>
              <Input
                id="receiptDate"
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
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
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction/Check number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Receipt description..."
            />
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
              <span>{formatCurrency(amount, currency)}</span>
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

