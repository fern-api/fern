require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.reqwithheaders.getwithcustomheader(
  test_endpoint_header: "testEndpointHeader",
  body: "string"
)
