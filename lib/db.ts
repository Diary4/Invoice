import { neon } from "@neondatabase/serverless"

// Lazy initialization to avoid build-time errors when DATABASE_URL is not available
let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = "postgresql://neondb_owner:npg_nhKBX5utDsy6@ep-noisy-forest-a83t4wa8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Please set it in your Vercel project settings: " +
        "Project Settings > Environment Variables > Add DATABASE_URL"
      )
    }
    sqlInstance = neon(databaseUrl)
  }
  return sqlInstance
}

// Export a proxy that lazily initializes the connection only at runtime
// This prevents build-time errors when DATABASE_URL is not available during build
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    const instance = getSql()
    const value = instance[prop as keyof ReturnType<typeof neon>]
    if (typeof value === "function") {
      return value.bind(instance)
    }
    return value
  },
})
