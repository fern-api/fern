require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.filterbyrole(
  role: "ADMIN",
  status: "active",
  secondary_role: "ADMIN"
)
