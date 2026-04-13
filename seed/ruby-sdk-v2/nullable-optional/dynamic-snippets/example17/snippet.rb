require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.testdeserialization(
  required_string: "requiredString",
  nullable_string: "nullableString",
  optional_string: "optionalString",
  optional_nullable_string: "optionalNullableString",
  nullable_enum: "ADMIN",
  optional_enum: "active",
  nullable_union: {
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  },
  optional_union: {
    type: "user",
    id: "id",
    username: "username",
    email: "email",
    phone: "phone",
    created_at: "2024-01-15T09:30:00Z",
    updated_at: "2024-01-15T09:30:00Z",
    address: {
      street: "street",
      city: "city",
      state: "state",
      zip_code: "zipCode",
      country: "country",
      building_id: "buildingId",
      tenant_id: "tenantId"
    }
  },
  nullable_list: %w[nullableList nullableList],
  nullable_map: {
    nullableMap: 1
  },
  nullable_object: {
    street: "street",
    city: "city",
    state: "state",
    zip_code: "zipCode",
    country: "country",
    building_id: "buildingId",
    tenant_id: "tenantId"
  },
  optional_object: {
    id: "id",
    name: "name",
    domain: "domain",
    employee_count: 1
  }
)
