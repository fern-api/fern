require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.listresources(
  page_limit: 1,
  before_date: "2023-01-15"
)
