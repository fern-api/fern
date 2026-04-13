require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.createuser(
  type: "CreateUserRequest",
  version: "v1",
  name: "name"
)
