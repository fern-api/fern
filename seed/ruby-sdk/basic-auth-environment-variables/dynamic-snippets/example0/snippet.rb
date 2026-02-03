require "seed"

client = Seed::Client.new(
  username: '<username>',
  access_token: '<password>',
  base_url: 'https://api.fern.com'
);

client.basic_auth.get_with_basic_auth();
