require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.pagination.list_items(
  cursor: "cursor",
  limit: 1
)
