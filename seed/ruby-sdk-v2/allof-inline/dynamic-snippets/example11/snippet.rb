require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_plant(
  species: "species",
  family: "family",
  genus: "genus",
  common_name: "commonName",
  watering_frequency: "daily",
  sun_exposure: "full",
  planted_at: "2023-01-15",
  soil_type: "soilType"
)
