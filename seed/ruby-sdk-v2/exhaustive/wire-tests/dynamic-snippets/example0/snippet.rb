require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inlinedrequests.postwithobjectbodyandresponse(
  string: "string",
  integer: 1,
  nested_object: {}
)
