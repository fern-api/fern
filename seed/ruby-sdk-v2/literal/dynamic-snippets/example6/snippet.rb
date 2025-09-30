require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.query.send_(
  prompt: 'You are a helpful assistant',
  optionalPrompt: 'You are a helpful assistant',
  aliasPrompt: 'You are a helpful assistant',
  aliasOptionalPrompt: 'You are a helpful assistant',
  stream: false,
  optionalStream: false,
  aliasStream: false,
  aliasOptionalStream: false,
  query: 'What is the weather today'
);
