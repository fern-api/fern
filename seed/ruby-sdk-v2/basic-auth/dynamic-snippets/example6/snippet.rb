require "seed"

client = seed::Client.new(
  username: '<username>',
  password: '<password>',
  base_url: 'https://api.fern.com'
);

client.basic_auth.post_with_basic_auth();
