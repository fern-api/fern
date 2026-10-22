require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.catalog.create_catalog_image(request: {
  catalog_object_id: "catalog_object_id"
})
