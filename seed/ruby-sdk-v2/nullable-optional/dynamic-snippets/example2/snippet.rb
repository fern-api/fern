require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.updateuser(user_id: "userId")
