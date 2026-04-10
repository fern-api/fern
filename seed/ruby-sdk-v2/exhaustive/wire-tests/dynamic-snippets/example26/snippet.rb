require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_mixed_required_and_optional_fields(
  required_string: "hello",
  required_integer: 0,
  optional_string: "world",
  required_long: 0
)
