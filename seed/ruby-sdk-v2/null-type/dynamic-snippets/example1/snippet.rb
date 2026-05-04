require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.conversations.outbound_call(
  to_phone_number: "to_phone_number",
  dry_run: true
)
