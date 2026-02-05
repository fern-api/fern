require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get_token(
  client_id: 'client_id',
  client_secret: 'client_secret'
);
