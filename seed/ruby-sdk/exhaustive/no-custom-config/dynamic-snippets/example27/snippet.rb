require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.params.modify_with_path(
  param: 'param',
  request: 'string'
);
