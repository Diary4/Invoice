// lib/data.ts
import { sql } from "@/lib/db" // the connection file you showed me
import type { Invoice } from "../../../types/index"

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    // This runs the raw SQL against Neon
    const data = await sql`
      SELECT * FROM invoices 
      ORDER BY created_at DESC
    `;
    
    // Note: You may need to map the data if your DB column names 
    // are snake_case (e.g., invoice_number) but your type uses camelCase.
    return data as unknown as Invoice[];
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
}