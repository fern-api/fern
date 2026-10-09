require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.refund(
  id: "id",
  amount: 1.1
)
