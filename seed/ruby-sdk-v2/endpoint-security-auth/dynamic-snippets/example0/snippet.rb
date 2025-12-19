require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token(
  client_id: 'client_id',
  client_secret: 'client_secret',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
  scope: 'scope'
);
