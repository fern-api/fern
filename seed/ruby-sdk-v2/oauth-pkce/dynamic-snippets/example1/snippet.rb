require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.oauth.authorize(
  response_type: "code",
  client_id: "client_id",
  redirect_uri: "redirect_uri",
  code_challenge: "code_challenge",
  code_challenge_method: "S256",
  scope: "scope",
  state: "state"
)
