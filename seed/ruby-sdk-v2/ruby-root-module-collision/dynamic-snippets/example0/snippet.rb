require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.seed.createwidget(
  name: "name",
  kind: "standard"
)
