require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.stream_x_fern_streaming_union
