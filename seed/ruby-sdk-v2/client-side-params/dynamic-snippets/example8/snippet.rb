require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_connections(
  strategy: 'strategy',
  name: 'name',
  fields: 'fields'
);
