require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.service.list_resources(
  pageLimit: 1,
  beforeDate: '2023-01-15'
);
