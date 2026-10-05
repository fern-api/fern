require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.params.create_with_body_and_query(
  fields: "_fields",
  string: "string"
)
