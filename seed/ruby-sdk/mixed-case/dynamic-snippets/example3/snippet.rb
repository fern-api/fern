require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.list_resources(
  page_limit: 1,
  before_date: '2023-01-15'
);
