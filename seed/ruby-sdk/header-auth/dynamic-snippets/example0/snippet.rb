require "seed"

client = Seed::Client.new(
  header_token_auth: '<value>',
  base_url: 'https://api.fern.com'
);

client.service.get_with_bearer_token();
