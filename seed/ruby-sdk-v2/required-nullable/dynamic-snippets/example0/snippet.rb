require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get_foo(
  requiredBaz: 'required_baz',
  requiredNullableBaz: 'required_nullable_baz'
);
