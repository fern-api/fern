require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.primitive.get_and_return_base_64(request: 'SGVsbG8gd29ybGQh');
