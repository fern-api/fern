require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.users.list_with_cursor_pagination(
  page: 1.1,
  perPage: 1.1,
  order: ,
  startingAfter: 'starting_after'
);
