require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.listwithcustompager(
  limit: 1,
  starting_after: "starting_after"
)
