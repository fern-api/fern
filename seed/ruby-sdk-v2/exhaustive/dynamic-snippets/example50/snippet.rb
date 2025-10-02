require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.req_with_headers.get_with_custom_header(
  xTestServiceHeader: 'X-TEST-SERVICE-HEADER',
  xTestEndpointHeader: 'X-TEST-ENDPOINT-HEADER'
);
