require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.container.get_and_return_list_of_objects(request: [{
  string: "string"
}, {
  string: "string"
}])
