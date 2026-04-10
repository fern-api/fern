require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_params.endpoints_params_get_with_path_and_errors(param: "param")
