require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.list_resources(
  page_limit: 10,
  before_date: '2023-01-01'
);
