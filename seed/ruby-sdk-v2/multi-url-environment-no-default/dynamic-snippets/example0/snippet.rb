require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.ec2.boot_instance(size: "size")
