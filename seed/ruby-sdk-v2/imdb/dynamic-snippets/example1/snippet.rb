require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.imdb.createmovie(
  title: "title",
  rating: 1.1
)
