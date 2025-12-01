require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_client(
  client_id: 'clientId',
  fields: 'fields',
  include_fields: true
);
