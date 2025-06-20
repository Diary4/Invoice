export interface CompanyInfo {
  name: string
  logo?: string
  address: string
  phone: string
  email: string
  website?: string
  taxId?: string
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Your Company Name",
  logo: "/placeholder.svg?height=80&width=200",
  address: "123 Business Street\nBaghdad, Iraq 10001",
  phone: "+964 770 123 4567",
  email: "info@yourcompany.com",
  website: "www.yourcompany.com",
  taxId: "TAX-123456789",
}
