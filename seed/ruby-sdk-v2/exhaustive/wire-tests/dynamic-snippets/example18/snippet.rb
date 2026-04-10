require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type
