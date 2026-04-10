require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client..extended_inline_request_body(
  docs: "docs",
  name: "name",
  unique: "unique"
)
