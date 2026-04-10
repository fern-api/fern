require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.searchusers(
  query: "query",
  department: "department",
  role: "role",
  is_active: true
)
