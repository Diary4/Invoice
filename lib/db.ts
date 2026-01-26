import { neon } from "@neondatabase/serverless"

// Lazy initialization to avoid build-time errors and work in production
let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    // Get database URL from environment variable (required in production)
    // Fallback to hardcoded URL only for local development
    let databaseUrl = process.env.DATABASE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? "postgresql://neondb_owner:npg_nhKBX5utDsy6@ep-noisy-forest-a83t4wa8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
        : null)
    
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Please set it in your Vercel project settings: " +
        "Project Settings > Environment Variables > Add DATABASE_URL"
      )
    }
    
    // Clean up the connection string
    // Remove channel_binding parameter as it can cause issues in serverless environments
    if (databaseUrl.includes("channel_binding")) {
      databaseUrl = databaseUrl.replace(/[&?]channel_binding=[^&]*/g, '')
    }
    
    // Ensure we're using the pooler endpoint (important for serverless)
    if (!databaseUrl.includes("-pooler.") && !databaseUrl.includes("pooler")) {
      console.warn("Warning: Not using pooler endpoint. This may cause connection issues in serverless environments.")
    }
    
    try {
      // Use default Neon configuration - it handles serverless environments well
      // The neon() function automatically uses fetchConnectionCache in serverless
      sqlInstance = neon(databaseUrl, {
        fetchConnectionCache: true,
      })
    } catch (error) {
      console.error("Error initializing Neon connection:", error)
      throw new Error(`Error connecting to database: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return sqlInstance
}

// Create a function that can be used as a template tag
function sqlTemplateTag(strings: TemplateStringsArray, ...values: any[]) {
  const instance = getSql()
  return instance(strings, ...values)
}

// Use a Proxy that handles both function calls (template tags) and property access
export const sql = new Proxy(sqlTemplateTag, {
  apply(_target, _thisArg, args) {
    // Handle template tag calls: sql`...`
    const instance = getSql()
    return instance(args[0], ...args.slice(1))
  },
  get(_target, prop) {
    // Handle property access: sql.transaction, etc.
    const instance = getSql()
    const value = instance[prop as keyof ReturnType<typeof neon>]
    if (typeof value === "function") {
      return value.bind(instance)
    }
    return value
  },
}) as ReturnType<typeof neon>
