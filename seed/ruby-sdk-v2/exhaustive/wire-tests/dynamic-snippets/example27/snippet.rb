require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_http_methods.endpoints_http_methods_test_delete(id: "id")
