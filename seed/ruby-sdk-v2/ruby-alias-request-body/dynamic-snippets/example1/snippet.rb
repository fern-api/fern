require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.create_store(display_name: "displayName")
