require "seed"

client = Seed::Client.new(
  api_key: "<value>",
  base_url: "https://api.fern.com"
)

client.token.get_token(
  client_id: "client_id",
  client_secret: "client_secret",
  audience: "https://api.example.com",
  grant_type: "client_credentials"
)
