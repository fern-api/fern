require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.submission.getexecutionsession(session_id: "sessionId")
