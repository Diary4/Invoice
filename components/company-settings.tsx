"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { COMPANY_INFO, type CompanyInfo } from "@/lib/company"
import { Building2, Save } from "lucide-react"

interface CompanySettingsProps {
  onSave: (companyInfo: CompanyInfo) => void
}

export function CompanySettings({ onSave }: CompanySettingsProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(COMPANY_INFO)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving (in a real app, this would save to database)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSave(companyInfo)
    setIsSaving(false)
  }

  const updateField = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Settings
        </CardTitle>
        <CardDescription>Update your company information that appears on invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your Company Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={companyInfo.logo || ""}
                onChange={(e) => updateField("logo", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={companyInfo.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123 Business Street&#10;City, Country 12345"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={companyInfo.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+964 770 123 4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="info@yourcompany.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={companyInfo.website || ""}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="www.yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID (Optional)</Label>
              <Input
                id="tax-id"
                value={companyInfo.taxId || ""}
                onChange={(e) => updateField("taxId", e.target.value)}
                placeholder="TAX-123456789"
              />
            </div>
          </div>

          {companyInfo.logo && (
            <div className="space-y-2">
              <Label>Logo Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Company Logo Preview"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Company Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
