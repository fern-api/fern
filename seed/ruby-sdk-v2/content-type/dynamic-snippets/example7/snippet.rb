require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.service.optionalmergepatchtest(
  required_field: "requiredField",
  optional_string: "optionalString",
  optional_integer: 1,
  optional_boolean: true,
  nullable_string: "nullableString"
)
