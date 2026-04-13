require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com",
  api_key: "<X-API-Key>"
)

client.auth.gettoken(
  client_id: "client_id",
  client_secret: "client_secret",
  audience: "https://api.example.com",
  grant_type: "client_credentials"
)
