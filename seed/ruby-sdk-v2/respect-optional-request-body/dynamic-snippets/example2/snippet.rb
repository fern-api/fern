require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.required_refund(
  id: "refund-id",
  amount: 60
)
