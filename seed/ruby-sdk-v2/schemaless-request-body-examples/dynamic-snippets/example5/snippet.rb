require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_plant_with_schema(
  name: "name",
  species: "species"
)
