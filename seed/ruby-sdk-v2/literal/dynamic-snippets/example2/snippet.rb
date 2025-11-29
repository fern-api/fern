require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.inlined.send_(
  temperature: 10.1,
  prompt: 'You are a helpful assistant',
  context: "You're super wise",
  aliased_context: "You're super wise",
  maybe_context: "You're super wise",
  object_with_literal: {
    nested_literal: {
      my_literal: 'How super cool'
    }
  },
  stream: false,
  query: 'What is the weather today'
);
