require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullable.getusers(
  avatar: "avatar",
  extra: true
)
