require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user_events_metadata.user_events_metadata_get_metadata(id: "id")
