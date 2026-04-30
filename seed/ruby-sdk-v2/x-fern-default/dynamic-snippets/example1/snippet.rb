require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.test_get(
  region: "region",
  limit: "limit"
)
