require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_map_of_documented_unknown_type(request: {})
