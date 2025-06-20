"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Users, DollarSign, Settings } from "lucide-react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoiceList } from "@/components/invoice-list"
import { InvoiceView } from "@/components/invoice-view"
import { CompanySettings } from "@/components/company-settings"

type View = "dashboard" | "create" | "list" | "view" | "settings"

export default function InvoiceSystem() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateInvoice = async (invoiceData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        setCurrentView("list")
      } else {
        console.error("Failed to create invoice")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewInvoice = (id: number) => {
    setSelectedInvoiceId(id)
    setCurrentView("view")
  }

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return <InvoiceForm onSubmit={handleCreateInvoice} isLoading={isLoading} />
      case "list":
        return <InvoiceList onViewInvoice={handleViewInvoice} />
      case "view":
        return selectedInvoiceId ? (
          <InvoiceView invoiceId={selectedInvoiceId} onBack={() => setCurrentView("list")} />
        ) : null
      case "settings":
        return <CompanySettings onSave={() => setCurrentView("dashboard")} />
      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Invoice Management System</h1>
              <p className="text-muted-foreground">
                Create, manage, and track invoices with support for USD and IQD currencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450</div>
                  <p className="text-xs text-muted-foreground">5 pending invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">+3 new this month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("create")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Invoice
                  </CardTitle>
                  <CardDescription>
                    Generate a new invoice for your customers with USD or IQD currency support
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("list")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    View All Invoices
                  </CardTitle>
                  <CardDescription>Browse, search, and manage all your existing invoices</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("settings")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Company Settings
                  </CardTitle>
                  <CardDescription>Configure your company information and branding</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {currentView !== "dashboard" && (
          <div className="mb-6">
            <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  )
}
