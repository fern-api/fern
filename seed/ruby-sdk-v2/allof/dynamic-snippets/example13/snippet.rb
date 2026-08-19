require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_tree(
  tree_species: "treeSpecies",
  height_in_feet: 1.1,
  id: "id",
  tree_name: "treeName",
  tree_description: "treeDescription",
  planted_date: "2023-01-15"
)
