require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_metadata(
  shallow: true,
  tag: ,
  xApiVersion: 'X-API-Version'
);
