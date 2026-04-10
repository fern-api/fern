require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.inlined.send_(
  prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  aliased_context: "You're super wise",
  object_with_literal: {
    nested_literal: {
      my_literal: "How super cool"
    }
  }
)
