require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.get_foo({
  optionalBaz:'optional_baz',
  optionalNullableBaz:'optional_nullable_baz',
  requiredBaz:'required_baz',
  requiredNullableBaz:'required_nullable_baz'
});
