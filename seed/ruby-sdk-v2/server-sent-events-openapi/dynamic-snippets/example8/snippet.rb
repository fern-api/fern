require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.stream_protocol_with_flat_schema
