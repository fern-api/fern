require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.bigunion.update_many(request: [{
  type: "normalSweet",
  value: "value"
}, {
  type: "normalSweet",
  value: "value"
}])
