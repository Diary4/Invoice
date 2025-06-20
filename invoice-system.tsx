"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Settings, Plus, LogOut, Clock } from "lucide-react"
import { CustomerManager } from "./components/customer-manager"
import { InvoiceForm } from "./components/invoice-form"
import { InvoiceList } from "./components/invoice-list"
import { InvoiceViewer } from "./components/invoice-viewer"
import { CompanySettings } from "./components/company-settings"
import { DashboardStats } from "./components/dashboard-stats"
import { useInvoiceSystem } from "./hooks/use-invoice-system"
import { useAuth } from "./hooks/use-auth"
import { LoginForm } from "./components/login-form"
import { formatCurrency } from "./lib/currency"

type View = "dashboard" | "customers" | "create-invoice" | "invoices" | "view-invoice" | "edit-invoice" | "settings"

export default function InvoiceSystem() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    customers,
    invoices,
    companyInfo,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateCompanyInfo,
    generateInvoicePDF,
  } = useInvoiceSystem()

  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  const handleViewInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setCurrentView("view-invoice")
  }

  const handleEditInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setCurrentView("edit-invoice")
  }

  const handleCreateInvoice = (invoiceData: any) => {
    addInvoice(invoiceData)
    setCurrentView("invoices")
  }

  const handleUpdateInvoice = (invoiceData: any) => {
    if (selectedInvoiceId) {
      updateInvoice(selectedInvoiceId, invoiceData)
      setCurrentView("invoices")
    }
  }

  // Handle create invoice navigation with customer check
  const handleCreateInvoiceClick = () => {
    if (customers.length === 0) {
      // If no customers, redirect to customers page first
      alert("Please add at least one customer before creating an invoice.")
      setCurrentView("customers")
    } else {
      setCurrentView("create-invoice")
    }
  }

  const selectedInvoice = selectedInvoiceId ? invoices.find((inv) => inv.id === selectedInvoiceId) : null

  const renderContent = () => {
    switch (currentView) {
      case "customers":
        return (
          <CustomerManager
            customers={customers}
            onAddCustomer={addCustomer}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        )
      case "create-invoice":
        // Show message if no customers exist
        if (customers.length === 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>No Customers Available</CardTitle>
                <CardDescription>You need to add at least one customer before creating an invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To create an invoice, you first need to have customers in your system. Click the button below to add
                  your first customer.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setCurrentView("customers")}>
                    <Users className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        }
        return (
          <InvoiceForm
            customers={customers}
            onSave={handleCreateInvoice}
            onCancel={() => setCurrentView("dashboard")}
          />
        )
      case "edit-invoice":
        return selectedInvoice ? (
          <InvoiceForm
            customers={customers}
            invoice={selectedInvoice}
            onSave={handleUpdateInvoice}
            onCancel={() => setCurrentView("invoices")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Not Found</CardTitle>
              <CardDescription>The invoice you're trying to edit could not be found.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setCurrentView("invoices")}>Back to Invoices</Button>
            </CardContent>
          </Card>
        )
      case "invoices":
        return (
          <InvoiceList
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onDeleteInvoice={deleteInvoice}
            onDownloadPDF={generateInvoicePDF}
          />
        )
      case "view-invoice":
        return selectedInvoice ? (
          <InvoiceViewer
            invoice={selectedInvoice}
            companyInfo={companyInfo}
            onEdit={() => handleEditInvoice(selectedInvoice.id)}
            onDownloadPDF={() => generateInvoicePDF(selectedInvoice)}
            onBack={() => setCurrentView("invoices")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Not Found</CardTitle>
              <CardDescription>The invoice you're trying to view could not be found.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setCurrentView("invoices")}>Back to Invoices</Button>
            </CardContent>
          </Card>
        )
      case "settings":
        return (
          <CompanySettings
            companyInfo={companyInfo}
            onSave={updateCompanyInfo}
            onCancel={() => setCurrentView("dashboard")}
          />
        )
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Invoice Management System</h1>
              <p className="text-xl text-muted-foreground">
                Welcome back, <span className="font-semibold">{user?.username}</span>!
              </p>
              <p className="text-muted-foreground">Manage your invoices with support for USD and IQD currencies</p>
            </div>

            {/* Stats */}
            <DashboardStats invoices={invoices} customers={customers} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                onClick={handleCreateInvoiceClick}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    Create Invoice
                  </CardTitle>
                  <CardDescription>
                    {customers.length === 0
                      ? "Add customers first, then create invoices with USD or IQD support"
                      : "Generate a new invoice for your customers with USD or IQD support"}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                onClick={() => setCurrentView("invoices")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    View Invoices
                  </CardTitle>
                  <CardDescription>Browse, search, and manage all your existing invoices</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                onClick={() => setCurrentView("customers")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    Manage Customers
                  </CardTitle>
                  <CardDescription>Add, edit, and organize your customer database</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices yet. Create your first invoice to get started!</p>
                    {customers.length === 0 && (
                      <p className="text-sm mt-2">
                        <Button variant="link" onClick={() => setCurrentView("customers")} className="p-0 h-auto">
                          Add customers first
                        </Button>{" "}
                        to start creating invoices.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewInvoice(invoice.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</p>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "sent"
                                  ? "secondary"
                                  : invoice.status === "overdue"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold">Invoice System</h2>
              <div className="hidden md:flex items-center gap-4">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => setCurrentView("dashboard")}
                  size="sm"
                >
                  Dashboard
                </Button>
                <Button
                  variant={currentView === "customers" ? "default" : "ghost"}
                  onClick={() => setCurrentView("customers")}
                  size="sm"
                >
                  Customers
                </Button>
                <Button
                  variant={currentView === "invoices" ? "default" : "ghost"}
                  onClick={() => setCurrentView("invoices")}
                  size="sm"
                >
                  Invoices
                </Button>
                <Button
                  variant={currentView === "create-invoice" ? "default" : "ghost"}
                  onClick={handleCreateInvoiceClick}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
                <Button
                  variant={currentView === "settings" ? "default" : "ghost"}
                  onClick={() => setCurrentView("settings")}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  )
}
