require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_connection(
  connection_id: 'connectionId',
  fields: 'fields'
);
