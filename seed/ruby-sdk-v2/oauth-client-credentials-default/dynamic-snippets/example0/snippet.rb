require "seed"

client = Seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token(
  client_id: 'client_id',
  client_secret: 'client_secret',
  grant_type: 'client_credentials'
);
