require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.simple.foo_without_endpoint_error({
  bar: 'bar'
});
