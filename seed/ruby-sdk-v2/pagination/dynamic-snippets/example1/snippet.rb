require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  starting_after: 'starting_after'
);
