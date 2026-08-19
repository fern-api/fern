require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.primitive.get_and_return_base64(request: "SGVsbG8gd29ybGQh")
