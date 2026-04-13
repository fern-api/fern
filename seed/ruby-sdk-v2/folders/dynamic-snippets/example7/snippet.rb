require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.folder_service.folder_service_endpoint
