require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.items.get_item(item_id: "item_id")
