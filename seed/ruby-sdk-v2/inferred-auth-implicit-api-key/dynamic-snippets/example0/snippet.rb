require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.auth.gettoken(api_key: "X-Api-Key")
