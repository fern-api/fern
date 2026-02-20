require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.no_req_body.get_with_no_request_body
