require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.validate_union_request(
  stream_response: true,
  prompt: "prompt"
)
