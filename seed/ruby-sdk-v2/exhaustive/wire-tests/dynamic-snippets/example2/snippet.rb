require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.container.get_and_return_set_of_primitives(request: Set.new(["string"]))
