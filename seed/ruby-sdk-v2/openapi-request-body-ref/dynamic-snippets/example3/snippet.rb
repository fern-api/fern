require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.vendor.create_vendor(
  idempotency_key: "idempotencyKey",
  name: "name",
  address: "address"
)
