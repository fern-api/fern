require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inline_users_inline_users.inline_users_inline_users_list_with_double_offset_pagination(
  page: 1.1,
  per_page: 1.1,
  order: "asc",
  starting_after: "starting_after"
)
