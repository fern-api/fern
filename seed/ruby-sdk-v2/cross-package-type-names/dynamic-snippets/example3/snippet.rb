require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.folder_d_service.folder_d_service_get_direct_thread
