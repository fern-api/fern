require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.refund(
  id: "id",
  body: {
    amount: 1.1
  }
)
