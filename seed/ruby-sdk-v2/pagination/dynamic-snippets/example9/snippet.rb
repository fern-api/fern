require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.inline_users.inline_users.list_with_cursor_pagination({});
