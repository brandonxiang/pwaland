const PUBLIC_SUPABASE_URL = "https://fdbyzxxoixqrynwvajfo.supabase.co"
const PUBLIC_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkYnl6eHhvaXhxcnlud3ZhamZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjE1ODg4MjUsImV4cCI6MTk3NzE2NDgyNX0.8X_u8aRq6l3MzOVW5yvd8BNxyglyzrqnQbG6MEkfMec"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY)

export default async function handler(req, res) {
  const { title, short_name, description, link, icon } = req.query

  let { error: queryError, count } = await supabase.from('pwaland')
  .select('title', { count: 'exact' }) 
  .eq('title', title)

  if(queryError) {
    res.status(500).json({
      message: "query fail",
      "error-message": queryError,
    })
    return;
  }

  if(count > 0) {
    res.status(500).json({
      message: `title: ${title} has already existed`
    })
    return;
  }

  let { data, error } = await supabase
    .from("pwaland")
    .upsert({ title, short_name, description, link, icon })


  if (error) {
    res.status(500).json({
      message: "insert fail",
      "error-message": error,
    })
  } else {
    res.status(200).json({ message: data })
  }
}
