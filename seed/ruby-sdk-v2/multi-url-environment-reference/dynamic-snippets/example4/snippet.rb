require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.files.upload(
  name: "name",
  parent_id: "parent_id"
)
