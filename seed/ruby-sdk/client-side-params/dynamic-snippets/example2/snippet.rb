require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.search_resources(
  limit: 1,
  offset: 1,
  query: 'query',
  filters: {}
);
