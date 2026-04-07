require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.update_plant(plant_id: "plantId")
