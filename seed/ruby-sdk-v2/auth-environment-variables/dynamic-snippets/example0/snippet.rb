require "seed"

client = seed::Client.new(
  api_key: '<value>',
  base_url: 'https://api.fern.com'
);

client.service.get_with_api_key();
