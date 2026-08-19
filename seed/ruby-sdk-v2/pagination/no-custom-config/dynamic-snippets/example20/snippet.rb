require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.list_with_body_offset_pagination(pagination: {
  page: 1
})
