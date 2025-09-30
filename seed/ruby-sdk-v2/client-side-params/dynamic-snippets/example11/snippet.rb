require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_client(
  clientId: 'clientId',
  fields: 'fields',
  includeFields: true
);
