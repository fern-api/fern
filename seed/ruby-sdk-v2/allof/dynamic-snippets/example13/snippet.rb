require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_tree(
  id: "id",
  tree_name: "treeName",
  tree_species: "treeSpecies",
  planted_date: "2023-01-15",
  height_in_feet: 1.1,
  tree_description: "treeDescription"
)
