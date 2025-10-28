require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.update_foo(
  id: 'id',
  xIdempotencyKey: 'X-Idempotency-Key',
  nullableText: 'nullable_text',
  nullableNumber: 1.1,
  nonNullableText: 'non_nullable_text'
);
