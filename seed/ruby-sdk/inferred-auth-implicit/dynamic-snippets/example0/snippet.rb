require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.auth.get_token_with_client_credentials(
  x_api_key: 'X-Api-Key',
  client_id: 'client_id',
  client_secret: 'client_secret',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
  scope: 'scope'
);
