require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.clients.create(client: {
  name: "Acme Corp",
  email: "contact@acme.com"
})
