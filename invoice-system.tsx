"use client"

import { useState } from "react"
import { useInvoiceSystem } from "./hooks/use-invoice-system"
import { CustomerManager } from "./components/customer-manager"
import { InvoiceForm } from "./components/invoice-form"
import { InvoiceList } from "./components/invoice-list"
import { InvoiceViewer } from "./components/invoice-viewer"
import { DashboardStats } from "./components/dashboard-stats"
import { Button } from "@/components/ui/button"
import type { Invoice } from "./types"
import { CompanySettings } from "./components/company-settings"

type View = "dashboard" | "customers" | "invoices" | "create-invoice" | "edit-invoice" | "view-invoice" | "settings"

export default function InvoiceSystem() {
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleCreateInvoice = () => {
    if (customers.length === 0) {
      alert("Please add at least one customer before creating an invoice.")
      return
    }
    setCurrentView("create-invoice")
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setCurrentView("edit-invoice")
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setCurrentView("view-invoice")
  }

  const handleSaveInvoice = (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => {
    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, invoiceData)
    } else {
      addInvoice(invoiceData)
    }
    setSelectedInvoice(null)
    setCurrentView("invoices")
  }

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id)
    }
  }

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer? This will also delete all associated invoices.")) {
      deleteCustomer(id)
    }
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId)
    generateInvoicePDF(invoice, customer)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoice System</h1>
          <div className="flex gap-2">
            <Button
              variant={currentView === "dashboard" ? "default" : "outline"}
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={currentView === "customers" ? "default" : "outline"}
              onClick={() => setCurrentView("customers")}
            >
              Customers
            </Button>
            <Button
              variant={currentView === "invoices" ? "default" : "outline"}
              onClick={() => setCurrentView("invoices")}
            >
              Invoices
            </Button>
            <Button
              variant={currentView === "settings" ? "default" : "outline"}
              onClick={() => setCurrentView("settings")}
            >
              Settings
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <DashboardStats customers={customers} invoices={invoices} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerManager
                customers={customers}
                onAddCustomer={addCustomer}
                onUpdateCustomer={updateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
              <InvoiceList
                invoices={invoices.slice(0, 5)}
                onView={handleViewInvoice}
                onEdit={handleEditInvoice}
                onDelete={handleDeleteInvoice}
                onCreateNew={handleCreateInvoice}
                onDownloadPDF={handleDownloadPDF}
              />
            </div>
          </div>
        )}

        {currentView === "customers" && (
          <CustomerManager
            customers={customers}
            onAddCustomer={addCustomer}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {currentView === "invoices" && (
          <InvoiceList
            invoices={invoices}
            onView={handleViewInvoice}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
            onCreateNew={handleCreateInvoice}
            onDownloadPDF={handleDownloadPDF}
          />
        )}

        {(currentView === "create-invoice" || currentView === "edit-invoice") && (
          <InvoiceForm
            customers={customers}
            invoice={selectedInvoice || undefined}
            onSave={handleSaveInvoice}
            onCancel={() => {
              setSelectedInvoice(null)
              setCurrentView("invoices")
            }}
          />
        )}

        {currentView === "view-invoice" && selectedInvoice && (
          <InvoiceViewer
            invoice={selectedInvoice}
            customer={customers.find((c) => c.id === selectedInvoice.customerId)}
            companyInfo={companyInfo}
            onClose={() => {
              setSelectedInvoice(null)
              setCurrentView("invoices")
            }}
            onEdit={() => {
              setCurrentView("edit-invoice")
            }}
            onDownloadPDF={() => handleDownloadPDF(selectedInvoice)}
          />
        )}

        {currentView === "settings" && <CompanySettings companyInfo={companyInfo} onUpdate={updateCompanyInfo} />}
      </main>
    </div>
  )
}
