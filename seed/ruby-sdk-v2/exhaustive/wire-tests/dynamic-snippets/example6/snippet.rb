require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.container.get_and_return_map_of_prim_to_undiscriminated_union(request: {
  string: 1.1
})
