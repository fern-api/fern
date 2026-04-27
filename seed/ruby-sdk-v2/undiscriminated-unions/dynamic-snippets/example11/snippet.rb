require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.union.get_with_base_properties(
  name: "name",
  value: {}
)
