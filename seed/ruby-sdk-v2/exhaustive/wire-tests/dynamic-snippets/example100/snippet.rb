require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.union.get_and_return_union(
  name: "name",
  likes_to_woof: true,
  animal: "dog"
)
