require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.bulk_refund(request: {
  amount: 1.1
})
