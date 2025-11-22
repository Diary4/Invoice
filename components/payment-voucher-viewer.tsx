"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, Receipt } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { PaymentVoucher, CompanyInfo } from "../types"

interface PaymentVoucherViewerProps {
  voucher: PaymentVoucher
  companyInfo: CompanyInfo
  onEdit: () => void
  onDownloadPDF: () => void
  onBack: () => void
}

export function PaymentVoucherViewer({ voucher, companyInfo, onEdit, onDownloadPDF, onBack }: PaymentVoucherViewerProps) {
  const getStatusColor = (status: PaymentVoucher["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payment Vouchers
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Voucher
          </Button>
          <Button onClick={onDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Voucher Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{voucher.voucherNumber}</CardTitle>
                <p className="text-muted-foreground">Payment Voucher Details</p>
              </div>
            </div>
            <Badge className={getStatusColor(voucher.status)}>
              {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex items-start gap-4">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain rounded-lg border"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-primary">{companyInfo.name}</h2>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.phone}</p>
                  <p>{companyInfo.email}</p>
                  {companyInfo.website && <p>{companyInfo.website}</p>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">PAYMENT VOUCHER</h1>
              <p className="text-lg font-semibold mt-2 text-muted-foreground">{voucher.voucherNumber}</p>
            </div>
          </div>

          {/* Voucher Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {voucher.customer && (
              <div>
                <h3 className="font-semibold text-primary mb-3">Paid To:</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{voucher.customer.name}</p>
                  <p className="text-muted-foreground">{voucher.customer.email}</p>
                  {voucher.customer.phone && <p className="text-muted-foreground">{voucher.customer.phone}</p>}
                  {voucher.customer.address && <p className="text-muted-foreground">{voucher.customer.address}</p>}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-medium">{new Date(voucher.paymentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">{voucher.currency}</span>
              </div>
              {voucher.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{voucher.paymentMethod.replace("_", " ").toUpperCase()}</span>
                </div>
              )}
              {voucher.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference Number:</span>
                  <span className="font-medium">{voucher.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Section */}
          <div className="flex justify-end">
            <div className="w-80 bg-muted/50 p-6 rounded-lg">
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <div className="flex justify-between font-bold text-2xl">
                    <span>Amount Paid:</span>
                    <span className="text-primary">{formatCurrency(voucher.amount, voucher.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          {((voucher.descriptions && voucher.descriptions.length > 0) || voucher.description) && (() => {
            // Normalize descriptions to DescriptionItem format
            let descriptionsList: Array<{ description: string; amount: number | string }> = []
            if (voucher.descriptions && voucher.descriptions.length > 0) {
              if (typeof voucher.descriptions[0] === 'object' && 'description' in voucher.descriptions[0]) {
                descriptionsList = voucher.descriptions as Array<{ description: string; amount: number | string }>
              } else {
                descriptionsList = (voucher.descriptions as string[]).map(desc => ({ description: desc, amount: 0 }))
              }
            } else if (voucher.description) {
              descriptionsList = [{ description: voucher.description, amount: 0 }]
            }
            
            return descriptionsList.length > 0 ? (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-primary mb-3">Descriptions:</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="text-left p-4 font-medium w-16">#</th>
                        <th className="text-left p-4 font-medium">Description</th>
                        <th className="text-right p-4 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {descriptionsList.map((item: { description: string; amount: number | string }, index: number) => {
                        const itemAmount = typeof item.amount === 'number' ? item.amount : (item.amount === '' || item.amount === null || item.amount === undefined ? 0 : Number.parseFloat(String(item.amount)) || 0)
                        return (
                          <tr key={index} className={index % 2 === 0 ? "bg-muted/25" : "bg-background"}>
                            <td className="p-4">{index + 1}</td>
                            <td className="p-4">{item.description}</td>
                            <td className="p-4 text-right">{formatCurrency(itemAmount, voucher.currency)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null
          })()}

          {/* Notes */}
          {voucher.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-primary mb-3">Notes:</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">{voucher.notes}</p>
              </div>
            </div>
          )}

          {/* Signature Section */}
          {(voucher.name || voucher.accountantName) && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-8 mt-6">
                {voucher.name && (
                  <div>
                    <p className="font-semibold mb-2">{voucher.name}</p>
                    <div className="border-t border-b border-gray-300 py-8 mb-2">
                      <p className="text-xs text-muted-foreground mb-4">Signature</p>
                    </div>
                    <div className="border-t border-b border-gray-300 py-2">
                      <p className="text-xs text-muted-foreground">Date</p>
                    </div>
                  </div>
                )}
                {voucher.accountantName && (
                  <div>
                    <p className="font-semibold mb-2">{voucher.accountantName}</p>
                    <div className="border-t border-b border-gray-300 py-8 mb-2">
                      <p className="text-xs text-muted-foreground mb-4">Signature</p>
                    </div>
                    <div className="border-t border-b border-gray-300 py-2">
                      <p className="text-xs text-muted-foreground">Date</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Thank you for your payment!</p>
            <p>For questions about this voucher, please contact us at {companyInfo.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

