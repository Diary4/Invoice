"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { CompanyInfo } from "../types"

interface CompanySettingsProps {
  companyInfo: CompanyInfo
  onSave: (updates: Partial<CompanyInfo>) => void
  onCancel: () => void
}

export function CompanySettings({ companyInfo, onSave, onCancel }: CompanySettingsProps) {
  const [formData, setFormData] = useState(companyInfo)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setIsEditing(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string
        setFormData((prev) => ({ ...prev, logo: logoUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const useSampleLogo = () => {
    setFormData((prev) => ({ ...prev, logo: "/placeholder-logo.png" }))
  }

  const handleCancel = () => {
    setFormData(companyInfo) // Reset form data
    setIsEditing(false)
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Company Settings</h2>
        {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Company Information</Button>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                {companyInfo.logo && (
                  <div className="flex-shrink-0">
                    <img
                      src={companyInfo.logo || "/placeholder.svg"}
                      alt="Company Logo"
                      className="w-20 h-20 object-contain border rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <h3
                    className="text-2xl font-semibold"
                    style={companyInfo.primaryColor ? { color: companyInfo.primaryColor } : {}}
                  >
                    {companyInfo.name}
                  </h3>
                  <p className="text-lg text-muted-foreground">{companyInfo.email}</p>
                  {companyInfo.primaryColor && (
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF Color: <span style={{ color: companyInfo.primaryColor }}>{companyInfo.primaryColor}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="mt-1 text-sm">{companyInfo.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="mt-1 text-sm">{companyInfo.phone}</p>
                </div>
              </div>

              {companyInfo.website && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                  <p className="mt-1 text-sm">{companyInfo.website}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Company Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  {formData.logo && (
                    <img
                      src={formData.logo || "/placeholder.svg"}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain border rounded"
                    />
                  )}
                  <div className="space-y-2">
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} className="w-auto" />
                    <Button type="button" variant="outline" size="sm" onClick={useSampleLogo}>
                      Use Sample Logo
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="primaryColor">Company Name Color (for PDFs)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor || "#000000"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor || "#000000"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This color will be applied to the company name in all generated PDFs
                </p>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
