require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.getuser(user_id: "userId")
