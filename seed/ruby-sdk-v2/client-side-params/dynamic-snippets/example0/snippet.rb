require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_resources(
  page: 1,
  perPage: 1,
  sort: 'created_at',
  order: 'desc',
  includeTotals: true,
  fields: 'fields',
  search: 'search'
);
