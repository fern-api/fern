require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.status.get_status
