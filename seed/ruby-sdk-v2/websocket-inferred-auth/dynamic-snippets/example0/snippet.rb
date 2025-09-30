require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.auth.get_token_with_client_credentials(
  xApiKey: 'X-Api-Key',
  clientId: 'client_id',
  clientSecret: 'client_secret',
  audience: 'https://api.example.com',
  grantType: 'client_credentials',
  scope: 'scope'
);
