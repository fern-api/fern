require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.update_foo(
  id: 'id',
  x_idempotency_key: 'X-Idempotency-Key',
  nullable_text: 'nullable_text',
  nullable_number: 1.1,
  non_nullable_text: 'non_nullable_text'
);
