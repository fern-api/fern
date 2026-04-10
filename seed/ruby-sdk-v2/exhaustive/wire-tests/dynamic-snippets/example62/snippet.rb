require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_params.endpoints_params_modify_with_inline_path(
  param: "param",
  body: "string"
)
