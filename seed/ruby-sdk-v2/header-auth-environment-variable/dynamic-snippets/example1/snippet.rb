require "seed"

client = Seed::Client.new(
  api_key: "<value>",
  base_url: "https://api.fern.com"
)

client.service.getwithbearertoken
