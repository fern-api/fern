require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.createmovie(
  id: "id",
  title: "title",
  from: "from",
  rating: 1.1,
  type: "movie",
  tag: "tag",
  metadata: {},
  revenue: 1000000
)
