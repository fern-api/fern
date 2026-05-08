require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inlined_requests.post_with_object_bodyand_response(
  string: "string",
  integer: 1,
  nested_object: {}
)
