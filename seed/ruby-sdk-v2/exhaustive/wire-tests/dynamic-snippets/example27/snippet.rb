require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_mixed_required_and_optional_fields(
  required_string: "requiredString",
  required_integer: 1,
  optional_string: "optionalString",
  required_long: 1000000
)
