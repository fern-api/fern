require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.union.testcamelcaseproperties(payment_method: {
  method_: "method",
  card_number: "cardNumber"
})
