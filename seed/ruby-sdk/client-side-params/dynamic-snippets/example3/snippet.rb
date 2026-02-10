require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_users(
  page: 1,
  per_page: 1,
  include_totals: true,
  sort: 'sort',
  connection: 'connection',
  q: 'q',
  search_engine: 'search_engine',
  fields: 'fields'
);
