require "seed"

client = Seed::Client.new(
  client_id: "<clientId>",
  client_secret: "<clientSecret>",
  base_url: "https://api.fern.com"
)

client.auth.get_token(
  audience: "pets",
  client_id: "client_id",
  client_secret: "client_secret",
  scopes: "scopes",
  grant_type: "client_credentials",
  tenant: "tenant",
  optional_hint: "optional_hint"
)
