require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.createusername(
  username: "username",
  password: "password",
  name: "name"
)
