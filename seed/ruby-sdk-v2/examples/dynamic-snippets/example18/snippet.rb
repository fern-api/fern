require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_metadata({
  shallow:true,
  xApiVersion:'X-API-Version'
});
