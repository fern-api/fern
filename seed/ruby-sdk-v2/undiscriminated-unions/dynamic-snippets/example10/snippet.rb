require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.union.aliased_object_union(request: {
  onlyInA: "onlyInA",
  sharedNumber: 1
})
