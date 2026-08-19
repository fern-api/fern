require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.stream_protocol_no_collision
