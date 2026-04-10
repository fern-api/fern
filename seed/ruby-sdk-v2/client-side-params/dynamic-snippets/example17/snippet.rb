require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.listconnections(
  strategy: "strategy",
  name: "name",
  fields: "fields"
)
