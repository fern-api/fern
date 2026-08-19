require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.widgets.create(
  api_version: "apiVersion",
  name: "name"
)
