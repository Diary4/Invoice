"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Building } from "lucide-react"
import type { CompanyInfo } from "../types"

interface CompanySettingsProps {
  companyInfo: CompanyInfo
  onUpdate: (info: CompanyInfo) => void
}

export function CompanySettings({ companyInfo, onUpdate }: CompanySettingsProps) {
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string
        setFormData({ ...formData, logo: logoUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </CardTitle>
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {companyInfo.logo && (
              <div className="flex-shrink-0">
                <img
                  src={companyInfo.logo || "/sample-logo.png"}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">{companyInfo.name}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{companyInfo.address}</p>
                <p>
                  {companyInfo.city}, {companyInfo.state} {companyInfo.zipCode}
                </p>
                <p>Phone: {companyInfo.phone}</p>
                <p>Email: {companyInfo.email}</p>
                {companyInfo.website && <p>Website: {companyInfo.website}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Edit Company Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {formData.logo && (
                <img
                  src={formData.logo || "/sample-logo.png"}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border rounded"
                />
              )}
              <div>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => document.getElementById("logo")?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, logo: "/sample-logo.png" })}
                  >
                    Use Sample Logo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
