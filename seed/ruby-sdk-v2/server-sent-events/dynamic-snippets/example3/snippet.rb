require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.completions.stream_without_terminator(query: "query")
