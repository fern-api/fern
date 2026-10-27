require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.params.upload_with_path(param: "upload-path")
