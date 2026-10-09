require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.reporting.load(
  cache: "stale-if-slow",
  status: "active"
)
