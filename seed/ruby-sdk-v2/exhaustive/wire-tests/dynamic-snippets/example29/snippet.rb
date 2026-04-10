require "seed"

client = Seed::MyClient.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.endpoints_http_methods.endpoints_http_methods_test_patch(
  id: "id",
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "uuid",
  base64: "base64",
  list: %w[list list],
  set: %w[set set],
  map: {
    map: "map"
  },
  bigint: 1
)
