import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://egdamuhvczhxuyvdmybr.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZGFtdWh2Y3poeHV5dmRteWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODQ0MjksImV4cCI6MjA3OTM2MDQyOX0.-tBr5if_qHFd55276j3fuuVHbSR0r-iVBjheD3BRhaE"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
