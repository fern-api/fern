require "seed"

client = Seed::Client.new(
  client_id: "<clientId>",
  client_secret: "<clientSecret>",
  base_url: "https://api.fern.com"
)

client.plants.get(plant_id: "plantId")
