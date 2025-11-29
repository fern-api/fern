require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_resources(
  page: 1,
  per_page: 1,
  sort: 'created_at',
  order: 'desc',
  include_totals: true,
  fields: 'fields',
  search: 'search'
);
