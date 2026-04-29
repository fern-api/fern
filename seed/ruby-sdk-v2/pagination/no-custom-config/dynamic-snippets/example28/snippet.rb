require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.list_usernames_with_optional_response(starting_after: "starting_after")
