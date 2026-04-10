require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.getsearchresults(
  query: "query",
  filters: {
    filters: "filters"
  },
  include_types: %w[includeTypes includeTypes]
)
