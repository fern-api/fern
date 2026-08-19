require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.catalog.get_catalog_image(image_id: "image_id")
