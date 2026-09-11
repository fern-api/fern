require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_required_nested_object(
  required_string: "hello",
  required_object: {
    string: "nested",
    nested_object: {}
  }
)
