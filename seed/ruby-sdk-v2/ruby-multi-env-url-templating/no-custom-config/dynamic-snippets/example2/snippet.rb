require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.core.list_things
