require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.getusermetadata(
  tenant_id: "tenant_id",
  user_id: "user_id",
  version: 1
)
