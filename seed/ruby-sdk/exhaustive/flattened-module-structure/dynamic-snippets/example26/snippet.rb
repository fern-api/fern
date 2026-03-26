require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_datetime_like_string(
  datetime_like_string: "2023-08-31T14:15:22Z",
  actual_datetime: "2023-08-31T14:15:22Z"
)
