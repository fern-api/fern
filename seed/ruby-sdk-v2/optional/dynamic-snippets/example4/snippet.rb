require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.optional.sendoptionalnullablewithalloptionalproperties(
  action_id: "actionId",
  id: "id"
)
