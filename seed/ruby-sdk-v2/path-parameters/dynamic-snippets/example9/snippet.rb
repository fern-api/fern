require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.updateuser(
  tenant_id: "tenant_id",
  user_id: "user_id",
  name: "name",
  tags: %w[tags tags]
)
