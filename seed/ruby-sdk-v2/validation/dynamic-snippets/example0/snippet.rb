require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.create(
  decimal: 2.2,
  even: 100,
  name: 'fern'
);
