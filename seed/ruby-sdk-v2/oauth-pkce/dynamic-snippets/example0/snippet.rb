require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.oauth.authorize(
  response_type: "code",
  client_id: "client_abc123",
  redirect_uri: "https://example.com/callback",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
  scope: "read write",
  state: "xyz"
)
