require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_user(
  password: "password",
  profile: {
    name: "name",
    verification: {},
    ssn: "ssn"
  }
)
