require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.getresource(resource_id: "ResourceID")
