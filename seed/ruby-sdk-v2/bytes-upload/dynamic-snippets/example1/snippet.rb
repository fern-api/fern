require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.upload_with_query_params(model: "nova-2")
