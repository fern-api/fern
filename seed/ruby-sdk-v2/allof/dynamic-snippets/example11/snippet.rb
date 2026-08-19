require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_plant(
  common_name: "commonName",
  watering_frequency: "daily",
  species: "species",
  family: "family",
  genus: "genus",
  sun_exposure: "full",
  planted_at: "2023-01-15",
  soil_type: "soilType"
)
