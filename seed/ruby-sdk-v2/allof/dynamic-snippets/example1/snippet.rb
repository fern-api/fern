require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.search_rule_types(query: "query")
