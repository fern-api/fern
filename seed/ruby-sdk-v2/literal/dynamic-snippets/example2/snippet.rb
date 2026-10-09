require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.headers.send_literals_only(request_options: {
  additional_headers: {
    "X-Endpoint-Version" => "02-12-2024",
    "X-Async" => "true"
  }
})
