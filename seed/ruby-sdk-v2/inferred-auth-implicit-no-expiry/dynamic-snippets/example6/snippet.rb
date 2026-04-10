require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nested_api.nested_api_get_something
