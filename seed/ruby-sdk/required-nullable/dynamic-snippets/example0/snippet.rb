require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get_foo(
  required_baz: 'required_baz',
  required_nullable_baz: 'required_nullable_baz'
);
