require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com",
  api_key: "<X-API-Key>"
)

client.user.getwithinferredauth
