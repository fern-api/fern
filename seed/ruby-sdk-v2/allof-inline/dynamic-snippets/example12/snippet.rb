require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.create_tree(
  id: "id",
  tree_name: "treeName",
  tree_species: "treeSpecies"
)
