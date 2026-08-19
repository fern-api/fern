require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.search_users(
  tenant_id: "tenant_id",
  user_id: "user_id",
  limit: 1
)
