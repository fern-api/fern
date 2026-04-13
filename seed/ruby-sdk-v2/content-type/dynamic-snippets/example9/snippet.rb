require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.regularpatch(
  id: "id",
  field1: "field1",
  field2: 1
)
