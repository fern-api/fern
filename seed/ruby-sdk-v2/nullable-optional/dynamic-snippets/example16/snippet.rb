require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.testdeserialization(
  required_string: "requiredString",
  nullable_enum: "ADMIN",
  nullable_union: {
    email_address: "emailAddress",
    subject: "subject",
    type: "email"
  },
  nullable_object: {
    street: "street",
    zip_code: "zipCode"
  }
)
