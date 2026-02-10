require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.query.send_(
  prompt: 'You are a helpful assistant',
  optional_prompt: 'You are a helpful assistant',
  alias_prompt: 'You are a helpful assistant',
  alias_optional_prompt: 'You are a helpful assistant',
  stream: false,
  optional_stream: false,
  alias_stream: false,
  alias_optional_stream: false,
  query: 'What is the weather today'
);
