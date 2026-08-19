require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.products.get(
  region_id: "regionId",
  product_id: "productId"
)
