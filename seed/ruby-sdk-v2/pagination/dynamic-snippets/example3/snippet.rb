require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inline_users.inline_users.list_with_body_cursor_pagination(pagination: {
  cursor: "cursor"
})
