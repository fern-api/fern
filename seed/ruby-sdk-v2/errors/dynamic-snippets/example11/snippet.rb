require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.simple.foo_with_examples({
  bar:'hello'
});
