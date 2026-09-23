require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.inlined_requests.post_with_array_body_and_headers(
  x_custom_header: "X-Custom-Header",
  body: %w[string string]
)
