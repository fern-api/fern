require "seed"

client = Seed::Client.new(
  username: "YOUR_USERNAME",
  access_token: "YOUR_PASSWORD",
  base_url: "https://api.fern.com"
)

client.basic_auth.get_with_basic_auth
