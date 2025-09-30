require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.headers.send_(
  endpointVersion: '02-12-2024',
  async: true,
  query: 'What is the weather today'
);
