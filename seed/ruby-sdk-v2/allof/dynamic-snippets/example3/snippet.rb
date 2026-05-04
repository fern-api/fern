require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_rule(
  name: "name",
  execution_context: "prod"
)
