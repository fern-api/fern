require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client..update_foo(
  id: "id",
  idempotency_key: "X-Idempotency-Key"
)
