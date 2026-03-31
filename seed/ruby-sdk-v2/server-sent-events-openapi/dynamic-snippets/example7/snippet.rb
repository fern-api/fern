require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.stream_no_context(query: "query")
