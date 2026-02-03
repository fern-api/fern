require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.primitive.get_and_return_datetime(request: '2024-01-15T09:30:00Z');
