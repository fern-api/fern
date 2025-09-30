require "seed"

client = seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.refresh_token(
  clientId: 'client_id',
  clientSecret: 'client_secret',
  refreshToken: 'refresh_token',
  audience: 'https://api.example.com',
  grantType: 'refresh_token',
  scope: 'scope'
);
