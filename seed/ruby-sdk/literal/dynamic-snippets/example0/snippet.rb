require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.headers.send_(
  endpoint_version: '02-12-2024',
  async: true,
  query: 'What is the weather today'
);
