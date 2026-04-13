require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.union.update(
  radius: 1.1,
  type: "circle"
)
