require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_documented_unknown_type(documented_unknown_type: {
  key: "value"
})
