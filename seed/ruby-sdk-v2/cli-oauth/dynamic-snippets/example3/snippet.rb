require "seed"

client = Seed::Client.new(
  client_id: "<clientId>",
  client_secret: "<clientSecret>",
  base_url: "https://api.fern.com"
)

client.auth.refresh_token(
  refresh_token: "refresh_token",
  grant_type: "refresh_token"
)
