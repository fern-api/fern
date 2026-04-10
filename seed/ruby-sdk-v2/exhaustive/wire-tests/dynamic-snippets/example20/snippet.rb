require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_enum.endpoints_enum_get_and_return_enum(request: "SUNNY")
