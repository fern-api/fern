require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.params.get_with_query(
  query: 'query',
  number: 1
);
