require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_container.endpoints_container_get_and_return_set_of_primitives(request: ["string"])
