require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.getresource(
  resource_id: "resourceId",
  include_metadata: true,
  format: "format"
)
