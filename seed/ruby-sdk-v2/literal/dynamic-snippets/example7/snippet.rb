require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.query.send_(
  prompt: "You are a helpful assistant",
  optional_prompt: "You are a helpful assistant",
  alias_prompt: "You are a helpful assistant",
  alias_optional_prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  optional_stream: true,
  alias_stream: true,
  alias_optional_stream: true
)
