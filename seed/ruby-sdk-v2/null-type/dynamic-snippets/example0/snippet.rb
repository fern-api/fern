require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.conversations.outboundcall(to_phone_number: "to_phone_number")
