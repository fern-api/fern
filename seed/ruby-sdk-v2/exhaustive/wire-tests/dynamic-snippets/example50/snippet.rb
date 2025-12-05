require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.req_with_headers.get_with_custom_header(
  x_test_service_header: 'X-TEST-SERVICE-HEADER',
  x_test_endpoint_header: 'X-TEST-ENDPOINT-HEADER'
);
