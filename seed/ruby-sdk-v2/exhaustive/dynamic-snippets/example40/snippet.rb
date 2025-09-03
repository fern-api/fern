require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.urls.with_mixed_case();
