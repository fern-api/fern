require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.organizations.searchorganizations(
  tenant_id: "tenant_id",
  organization_id: "organization_id"
)
