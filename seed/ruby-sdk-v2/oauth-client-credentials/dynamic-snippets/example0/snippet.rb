require "seed"

client = seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token_with_client_credentials(
  clientId: 'my_oauth_app_123',
  clientSecret: 'sk_live_abcdef123456789',
  audience: 'https://api.example.com',
  grantType: 'client_credentials',
  scope: 'read:users'
);
