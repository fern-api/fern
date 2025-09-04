require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.auth.refresh_token({
  xApiKey:'X-Api-Key',
  clientId:'client_id',
  clientSecret:'client_secret',
  refreshToken:'refresh_token',
  audience:'https://api.example.com',
  grantType:'refresh_token',
  scope:'scope'
});
