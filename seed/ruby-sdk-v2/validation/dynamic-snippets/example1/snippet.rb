require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.get(
  decimal: 2.2,
  even: 100,
  name: 'fern'
);
