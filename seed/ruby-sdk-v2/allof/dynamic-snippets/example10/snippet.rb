require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_plant(
  species: "species",
  family: "family",
  genus: "genus",
  sun_exposure: "full"
)
