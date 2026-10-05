require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.list_with_offset_pagination_has_next_page(
  page: 1,
  limit: 3,
  order: "asc"
)
