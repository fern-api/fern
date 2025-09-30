require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.list_clients(
  fields: 'fields',
  includeFields: true,
  page: 1,
  perPage: 1,
  includeTotals: true,
  isGlobal: true,
  isFirstParty: true,
  appType: ['app_type', 'app_type']
);
