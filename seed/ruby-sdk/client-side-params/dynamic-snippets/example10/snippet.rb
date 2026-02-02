require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_clients(
  fields: 'fields',
  include_fields: true,
  page: 1,
  per_page: 1,
  include_totals: true,
  is_global: true,
  is_first_party: true,
  app_type: ['app_type', 'app_type']
);
