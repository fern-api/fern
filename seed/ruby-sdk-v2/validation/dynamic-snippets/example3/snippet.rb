require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client..get(
  decimal: 1.1,
  even: 1,
  name: "name"
)
