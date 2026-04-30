require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.completions.stream_events_context_protocol(query: "")
