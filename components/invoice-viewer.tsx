"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Edit } from "lucide-react"
import { formatCurrency } from "../lib/currency"
import { numberToWords } from "../lib/number-to-words"
import type { Invoice, CompanyInfo } from "../types"

interface InvoiceViewerProps {
  invoice: Invoice
  companyInfo: CompanyInfo
  onEdit: () => void
  onDownloadPDF?: () => void
  onBack: () => void
}

export function InvoiceViewer({ invoice, companyInfo, onEdit, onDownloadPDF, onBack }: InvoiceViewerProps) {
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  return (
    <div className="space-y-6 min-h-screen flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none flex-1 flex flex-col">
        {/* Header Section with Vertical Strip */}
        <div className="flex border-b-2 border-gray-300">
          {/* Left Vertical Strip */}
          <div className="w-3 bg-teal-400"></div>
          
          {/* Main Header Content */}
          <div className="flex-1 flex items-start justify-between p-6">
            {/* Left Side - Company Name */}
            <div className="flex flex-col justify-start h-full">
              <div className="text-sm font-medium leading-tight">
                <p>For Trading solar system,</p>
                <p>Construction materials and</p>
                <p>For General Trading LTD</p>
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex flex-col items-center justify-start">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-20 w-auto mb-2"
                />
              )}
              <h1 className="text-2xl font-bold">{companyInfo.name.split(' ')[0]}</h1>
              <p className="text-sm font-medium">Solar System Energy</p>
            </div>

            {/* Right Side - Arabic/Kurdish Text */}
            <div className="text-right text-sm font-medium self-start" dir="rtl">
              <p>بو بازرگانی ووزه‌ی خۆر</p>
              <p>و بیناسازی</p>
              <p>و بازرگانی گشتی</p>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Nanas is Exclusive Agent</span>
              <div className="flex items-center gap-1">
                <span className="text-red-600 font-bold">RONMA Light Our Future</span>
              </div>
              <span>in Iraq</span>
            </div>
            <div dir="rtl">
              <p>نةناس وكيل حصري لوحة رونما من العراق</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="px-6 py-4 space-y-2 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              {invoice.customer && (
                <>
                  <p className="font-bold">
                    To/{invoice.customer.name}
                    {invoice.customer.phone && `/${invoice.customer.phone}`}
                  </p>
                  {invoice.items && invoice.items.length > 0 && (
                    <p className="font-bold">Sub/{invoice.items[0].description}</p>
                  )}
                </>
              )}
            </div>
            <div className="text-right space-y-1">
              <p>Date: {formatDate(invoice.issueDate)}</p>
              <p>Inv: {invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 py-4">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-white">
                <th className="border border-gray-400 p-2 text-left text-xs font-bold">NO.</th>
                <th className="border border-gray-400 p-2 text-left text-xs font-bold">DESCRIPTION OF GOODS</th>
                <th className="border border-gray-400 p-2 text-center text-xs font-bold">pallet</th>
                <th className="border border-gray-400 p-2 text-center text-xs font-bold">pcs</th>
                <th className="border border-gray-400 p-2 text-center text-xs font-bold">total - PCS</th>
                <th className="border border-gray-400 p-2 text-right text-xs font-bold">UNIT PRICE ({invoice.currency}/PCS)</th>
                <th className="border border-gray-400 p-2 text-right text-xs font-bold">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => {
                const totalQuantity = (item.quantity || 0) * (item.pallet || 0)
                return (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-400 p-2">{item.description}</td>
                    <td className="border border-gray-400 p-2 text-center">{item.pallet || 0}</td>
                    <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-400 p-2 text-center font-medium">{totalQuantity}</td>
                    <td className="border border-gray-400 p-2 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                    <td className="border border-gray-400 p-2 text-right font-medium">{formatCurrency(item.total, invoice.currency)}</td>
                  </tr>
                )
              })}
              <tr className="bg-white font-bold">
                <td colSpan={6} className="border border-gray-400 p-2 text-center">TOTAL:</td>
                <td className="border border-gray-400 p-2 text-right">{formatCurrency(invoice.total, invoice.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warranty Section */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2 text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>Attached serial number with invoice</li>
                <li>تحمل الشركة المجهزة الضمانات الموجود في العرض .</li>
                <li>( لا يشمل الضمان الكسر او التلف او التركيب الخاطيء )</li>
                <li>Ronma panel 15 years warranty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        {(() => {
          const amountLanguage = (invoice as any).amountLanguage || (invoice as any).amount_language
          return amountLanguage ? (
            <div className="px-6 py-4 border-t border-gray-200">
              <p className="font-medium text-sm" dir={amountLanguage === "arabic" || amountLanguage === "kurdish" ? "rtl" : "ltr"}>
                {numberToWords(invoice.total, amountLanguage as "english" | "arabic" | "kurdish", invoice.currency)}
              </p>
            </div>
          ) : null
        })()}

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Footer - This will now push to the bottom */}
        <div className="mt-auto px-6 py-4 border-t-2 border-gray-300 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="text-xs space-y-1">
              <p>Add: {companyInfo.address}</p>
              {companyInfo.website && <p>{companyInfo.website}</p>}
              <p>{companyInfo.phone}</p>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="mt-4 h-4 flex gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${i % 3 === 0 ? "bg-teal-400" : i % 3 === 1 ? "bg-orange-400" : "bg-blue-400"}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}