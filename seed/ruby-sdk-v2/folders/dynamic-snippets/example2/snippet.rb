require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.ab.a_b_foo
