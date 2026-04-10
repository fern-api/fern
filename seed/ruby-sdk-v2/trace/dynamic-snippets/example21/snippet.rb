require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.homepage.sethomepageproblems(request: %w[string string])
