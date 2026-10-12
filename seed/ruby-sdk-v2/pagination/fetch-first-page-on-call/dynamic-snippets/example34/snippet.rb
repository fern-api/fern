require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.list_with_aliased_data(
  page: 1,
  per_page: 1,
  starting_after: "starting_after"
)
