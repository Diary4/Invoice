"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Plus, Download } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import type { ReceiptVoucher } from "../types"

interface ReceiptVoucherListProps {
  vouchers: ReceiptVoucher[]
  onViewVoucher: (id: string) => void
  onEditVoucher: (id: string) => void
  onDeleteVoucher: (id: string) => void
  onDownloadPDF: (voucher: ReceiptVoucher) => void
  onCreateVoucher?: () => void
}

export function ReceiptVoucherList({
  vouchers,
  onViewVoucher,
  onEditVoucher,
  onDeleteVoucher,
  onDownloadPDF,
  onCreateVoucher,
}: ReceiptVoucherListProps) {
  const getStatusColor = (status: ReceiptVoucher["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Receipt Vouchers ({vouchers.length})</CardTitle>
          {onCreateVoucher && (
            <Button onClick={onCreateVoucher} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Receipt Voucher
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {vouchers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No receipt vouchers yet. Create your first voucher!</p>
        ) : (
          <div className="space-y-2">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{voucher.voucherNumber}</h3>
                    <Badge className={getStatusColor(voucher.status)}>{voucher.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{voucher.customer?.name || "No customer"}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(voucher.receiptDate).toLocaleDateString()}
                    {voucher.paymentMethod && ` • Method: ${voucher.paymentMethod}`}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold">{formatCurrency(voucher.amount, voucher.currency)}</p>
                  {voucher.referenceNumber && (
                    <p className="text-sm text-muted-foreground">Ref: {voucher.referenceNumber}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewVoucher(voucher.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditVoucher(voucher.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownloadPDF(voucher)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDeleteVoucher(voucher.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

