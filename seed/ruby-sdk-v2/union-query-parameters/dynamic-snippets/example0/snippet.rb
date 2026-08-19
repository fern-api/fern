require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.events.subscribe(
  event_type: "group.created",
  tags: "tags"
)
