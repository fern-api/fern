require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nested_no_auth_api.nested_no_auth_api_get_something
