require "seed"

client = Seed::Client.new(
  base_url: "https://api.fern.com",
  api_key: "<X-Api-Key>"
)

client.auth.refreshtoken(
  client_id: "client_id",
  client_secret: "client_secret",
  refresh_token: "refresh_token",
  audience: "https://api.example.com",
  grant_type: "refresh_token",
  scope: "scope"
)
