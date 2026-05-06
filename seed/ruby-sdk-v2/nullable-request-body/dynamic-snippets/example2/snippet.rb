require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.testgroup.test_method_name(
  path_param: "path_param",
  query_param_object: {
    id: "id",
    name: "name"
  },
  query_param_integer: 1,
  body: {
    id: "id",
    name: "name"
  }
)
