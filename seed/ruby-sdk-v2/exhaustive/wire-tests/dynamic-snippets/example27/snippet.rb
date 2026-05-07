require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.content_type.content_type_post_json_patch_content_type
