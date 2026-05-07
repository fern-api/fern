require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.put.endpoints_put_add(id: "id")
