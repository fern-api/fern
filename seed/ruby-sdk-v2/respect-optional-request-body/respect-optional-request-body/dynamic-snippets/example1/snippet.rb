require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.refund(
  id: "refund-id",
  amount: 60
)
