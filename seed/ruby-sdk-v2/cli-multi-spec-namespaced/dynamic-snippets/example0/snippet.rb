require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com",
  api_key: "<X-Api-Key>"
)

client.v1.list_users
