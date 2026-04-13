require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.folder_a_service.folder_a_service_get_direct_thread
