require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.echo(
  id: "id-ksfd9c1",
  name: "Hello world!",
  size: 20
)
