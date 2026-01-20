require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.users.list_with_top_level_body_cursor_pagination(
  cursor: 'initial_cursor',
  filter: 'active'
);
