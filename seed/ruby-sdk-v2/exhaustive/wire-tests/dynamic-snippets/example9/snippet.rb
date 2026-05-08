require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.req_with_headers.get_with_custom_header(
  test_endpoint_header: "X-TEST-ENDPOINT-HEADER",
  body: "string"
)
