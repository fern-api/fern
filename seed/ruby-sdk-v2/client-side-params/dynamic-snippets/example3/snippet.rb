require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_users(
  page: 1,
  perPage: 1,
  includeTotals: true,
  sort: 'sort',
  connection: 'connection',
  q: 'q',
  searchEngine: 'search_engine',
  fields: 'fields'
);
