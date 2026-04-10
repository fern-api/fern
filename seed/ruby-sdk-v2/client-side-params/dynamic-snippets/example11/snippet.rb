require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.getuserbyid(
  user_id: "userId",
  fields: "fields",
  include_fields: true
)
