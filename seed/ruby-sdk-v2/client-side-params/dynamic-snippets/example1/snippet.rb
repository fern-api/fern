require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.listresources(
  page: 1,
  per_page: 1,
  sort: "sort",
  order: "order",
  include_totals: true,
  fields: "fields",
  search: "search"
)
