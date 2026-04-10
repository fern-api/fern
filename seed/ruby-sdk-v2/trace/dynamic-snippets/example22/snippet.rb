require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.migration.getattemptedmigrations(admin_key_header: "admin-key-header")
