require "seed"

client = seed::Client.new(
  api_key: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_with_bearer_token();
