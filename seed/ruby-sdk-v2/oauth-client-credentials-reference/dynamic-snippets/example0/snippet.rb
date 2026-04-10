require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.auth.gettoken(
  client_id: "client_id",
  client_secret: "client_secret"
)
