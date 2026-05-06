require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.testgroup.test_method_name(
  path_param: "path_param",
  body: {}
)
