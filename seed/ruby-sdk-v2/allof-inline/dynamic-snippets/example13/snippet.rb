require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_tree(
  id: "id",
  tree_name: "treeName",
  tree_description: "treeDescription",
  tree_species: "treeSpecies",
  height_in_feet: 1.1,
  planted_date: "2023-01-15"
)
