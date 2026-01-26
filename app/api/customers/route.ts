import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const customers = await sql`
      SELECT * FROM customers 
      ORDER BY name ASC
    `

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Check for specific error types
    let hint = undefined
    if (errorMessage.includes("DATABASE_URL")) {
      hint = "Please set DATABASE_URL in Vercel environment variables"
    } else if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ETIMEDOUT")) {
      hint = "Database connection failed. The database might be paused. Please check your Neon dashboard and ensure the database is active."
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch customers", 
        details: errorMessage,
        hint,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, address } = await request.json()

    const [customer] = await sql`
      INSERT INTO customers (name, email, phone, address)
      VALUES (${name}, ${email}, ${phone}, ${address})
      RETURNING *
    `

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
