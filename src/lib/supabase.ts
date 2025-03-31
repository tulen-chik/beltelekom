import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rtxnqfslyargmuloqrde.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eG5xZnNseWFyZ211bG9xcmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5MjE0MywiZXhwIjoyMDUwMTY4MTQzfQ.CluYOaI-Wnk-97UoHNvoxunKw2Y930fiMvAhfyzA_ps"

export const supabase = createClient(supabaseUrl, supabaseKey)