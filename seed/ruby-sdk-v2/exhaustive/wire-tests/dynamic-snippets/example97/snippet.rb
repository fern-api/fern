require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_union.endpoints_union_get_and_return_union(
  name: "name",
  likes_to_woof: true,
  animal: "dog"
)
