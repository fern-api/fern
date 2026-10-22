require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.messages.messages.delete_message(sid: "sid")
