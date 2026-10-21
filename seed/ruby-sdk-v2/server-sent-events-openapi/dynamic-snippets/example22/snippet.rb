require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.stream_x_fern_streaming_shared_schema(
  prompt: "prompt",
  model: "model",
  stream: false
)
