require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inline_users_inline_users.inline_users_inline_users_list_with_offset_step_pagination(
  page: 1,
  limit: 1,
  order: "asc"
)
