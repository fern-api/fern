require "seed"

client = Seed::Client.new(
  base_url: "https://api.fern.com",
  api_key: "<X-Api-Key>"
)

client.auth.gettokenwithclientcredentials(
  client_id: "client_id",
  client_secret: "client_secret",
  audience: "https://api.example.com",
  grant_type: "client_credentials"
)
