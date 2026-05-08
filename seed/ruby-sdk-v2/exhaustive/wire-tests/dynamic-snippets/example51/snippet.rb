require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_nested_with_required_field(
  string_value: "string",
  string: "string",
  nested_object: {}
)
