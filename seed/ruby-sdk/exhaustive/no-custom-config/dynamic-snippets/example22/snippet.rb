require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints.object.get_and_return_with_datetime_like_string(
  datetime_like_string: "datetimeLikeString",
  actual_datetime: "2024-01-15T09:30:00Z"
)
