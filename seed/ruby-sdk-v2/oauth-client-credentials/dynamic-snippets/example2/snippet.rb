require "seed"

client = Seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.refresh_token(
  clientId: 'my_oauth_app_123',
  clientSecret: 'sk_live_abcdef123456789',
  refreshToken: 'refresh_token',
  audience: 'https://api.example.com',
  grantType: 'refresh_token',
  scope: 'read:users'
);
