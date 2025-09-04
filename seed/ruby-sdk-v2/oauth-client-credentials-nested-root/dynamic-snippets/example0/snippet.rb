require "seed"

client = seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token({
  clientId:'client_id',
  clientSecret:'client_secret',
  audience:'https://api.example.com',
  grantType:'client_credentials',
  scope:'scope'
});
