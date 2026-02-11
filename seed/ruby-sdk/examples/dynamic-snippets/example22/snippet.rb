require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.refresh_token(request: {
  ttl: 1
});
