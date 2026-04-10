require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_primitive.endpoints_primitive_get_and_return_double(request: 1.1)
