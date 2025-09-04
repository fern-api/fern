require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.service.list_resources({
  pageLimit:10,
  beforeDate:'2023-01-01'
});
