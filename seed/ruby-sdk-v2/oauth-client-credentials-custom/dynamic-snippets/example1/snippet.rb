require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.auth.gettokenwithclientcredentials(
  cid: "cid",
  csr: "csr",
  scp: "scp",
  entity_id: "entity_id",
  audience: "https://api.example.com",
  grant_type: "client_credentials",
  scope: "scope"
)
