require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.with_ref_body(
  image_file: "/path/to/your/file",
  request: {
    foo: "bar"
  }
)
