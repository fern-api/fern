require "fernexamples"

client = FernExamples::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_metadata(
  shallow: false,
  x_api_version: '0.0.1'
);
