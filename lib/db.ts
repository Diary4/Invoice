import { neon } from "@neondatabase/serverless"

// Get database URL from environment or use the hardcoded one
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_nhKBX5utDsy6@ep-noisy-forest-a83t4wa8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please set it in your Vercel project settings: " +
    "Project Settings > Environment Variables > Add DATABASE_URL"
  )
}

// Initialize the SQL instance directly
// API routes always run on the server, so this is safe
export const sql = neon(databaseUrl)
