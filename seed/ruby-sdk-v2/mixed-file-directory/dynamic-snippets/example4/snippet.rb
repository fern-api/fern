require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user_events.user_events_list_events
