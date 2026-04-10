require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.sysprop.setnumwarminstances(
  language: "JAVA",
  num_warm_instances: 1
)
