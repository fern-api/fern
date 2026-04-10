require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.query.send_(
  prompt: "You are a helpful assistant",
  alias_prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  alias_stream: true
)
