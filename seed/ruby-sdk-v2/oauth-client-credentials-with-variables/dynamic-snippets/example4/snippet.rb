require "seed"

client = seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.service.post();
