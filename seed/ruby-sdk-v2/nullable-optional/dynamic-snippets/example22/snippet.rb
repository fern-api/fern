require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.updatetags(user_id: "userId")
