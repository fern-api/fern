require "seed"

client = Seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token_with_client_credentials(
  client_id: 'my_oauth_app_123',
  client_secret: 'sk_live_abcdef123456789',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
  scope: 'read:users'
);
