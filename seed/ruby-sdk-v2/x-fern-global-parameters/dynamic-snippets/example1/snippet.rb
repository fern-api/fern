require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.products.search(
  region_id: "regionId",
  query: "query",
  config: {
    currency: "currency",
    limit: 1
  }
)
