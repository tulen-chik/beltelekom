import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gpuahnwdmduxhlpnirvz.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdWFobndkbWR1eGhscG5pcnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTUzMzAsImV4cCI6MjA1OTUzMTMzMH0._xlVDJQ8l48Mj_cp7Qkyl8BR6hchyj6yvHP5PG3ijRk"

export const supabase = createClient(supabaseUrl, supabaseKey)