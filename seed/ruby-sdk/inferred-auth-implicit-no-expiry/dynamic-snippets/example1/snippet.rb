require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.auth.refresh_token(
  x_api_key: 'X-Api-Key',
  client_id: 'client_id',
  client_secret: 'client_secret',
  refresh_token: 'refresh_token',
  audience: 'https://api.example.com',
  grant_type: 'refresh_token',
  scope: 'scope'
);
