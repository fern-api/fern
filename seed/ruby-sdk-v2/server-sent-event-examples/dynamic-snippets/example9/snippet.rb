require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.completions.stream_events_discriminant_in_data(query: "query")
