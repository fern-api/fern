require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.union.aliased_object_union(request: {
  only_in_a: "onlyInA",
  shared_number: 1
})
