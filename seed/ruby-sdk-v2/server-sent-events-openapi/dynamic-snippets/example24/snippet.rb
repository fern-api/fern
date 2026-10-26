require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.validate_completion(
  prompt: "prompt",
  model: "model"
)
