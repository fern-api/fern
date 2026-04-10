require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_pagination.endpoints_pagination_list_items(
  cursor: "cursor",
  limit: 1
)
