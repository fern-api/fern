require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.users.list_with_body_cursor_pagination(pagination: {
  cursor: "cursor"
})
