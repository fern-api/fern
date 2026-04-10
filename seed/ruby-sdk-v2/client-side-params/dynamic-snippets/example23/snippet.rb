require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.getclient(
  client_id: "clientId",
  fields: "fields",
  include_fields: true
)
