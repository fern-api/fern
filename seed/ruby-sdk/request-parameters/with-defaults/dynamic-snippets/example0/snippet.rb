require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.create_username(
  tags: %w[tags tags],
  username: "username",
  password: "password",
  name: "test"
)
