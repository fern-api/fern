require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.refund(
  id: "refund-id",
  body: {
    amount: 60
  }
)
