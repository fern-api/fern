require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.user.createuser(
  tenant_id: "tenant_id",
  name: "name",
  tags: %w[tags tags]
)
