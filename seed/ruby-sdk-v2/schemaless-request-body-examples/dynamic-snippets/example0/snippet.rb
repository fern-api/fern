require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_plant(request: {
  name: "Venus Flytrap",
  species: "Dionaea muscipula",
  care: {
    light: "full sun",
    water: "distilled only",
    humidity: "high"
  },
  tags: %w[carnivorous tropical]
})
