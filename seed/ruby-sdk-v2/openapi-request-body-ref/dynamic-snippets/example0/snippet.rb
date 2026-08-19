require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.vendor.update_vendor(
  vendor_id: "vendor_id",
  name: "name"
)
