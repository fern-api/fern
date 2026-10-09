require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.completions.stream_non_resumable(query: "bar")
