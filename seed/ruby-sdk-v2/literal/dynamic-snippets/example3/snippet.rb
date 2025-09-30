require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.inlined.send_(
  prompt: 'You are a helpful assistant',
  context: "You're super wise",
  query: 'query',
  temperature: 1.1,
  stream: false,
  aliasedContext: "You're super wise",
  maybeContext: "You're super wise",
  objectWithLiteral: {
    nestedLiteral: {
      myLiteral: 'How super cool'
    }
  }
);
