require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.messages.messages.create_message(
  sid: "sid",
  body: "body"
)
