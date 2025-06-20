"use client"
import InvoiceSystem from "../invoice-system"

type View = "dashboard" | "create" | "list" | "view" | "settings"

export default function Home() {
  return <InvoiceSystem />
}

// The rest of the code from the existing app/page.tsx can be kept here if needed for reference or future updates.
