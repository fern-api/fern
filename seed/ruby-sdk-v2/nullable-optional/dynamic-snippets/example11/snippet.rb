require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.createcomplexprofile(
  id: "id",
  nullable_role: "ADMIN",
  optional_role: "ADMIN",
  optional_nullable_role: "ADMIN",
  nullable_status: "active",
  optional_status: "active",
  optional_nullable_status: "active",
  nullable_notification: {
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  },
  optional_notification: {
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  },
  optional_nullable_notification: {
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  },
  nullable_search_result: {
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
  optional_search_result: {
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
  nullable_array: %w[nullableArray nullableArray],
  optional_array: %w[optionalArray optionalArray],
  optional_nullable_array: %w[optionalNullableArray optionalNullableArray],
  nullable_list_of_nullables: %w[nullableListOfNullables nullableListOfNullables],
  nullable_map_of_nullables: {
    nullableMapOfNullables: {
      street: "street",
      city: "city",
      state: "state",
      zip_code: "zipCode",
      country: "country",
      building_id: "buildingId",
      tenant_id: "tenantId"
    }
  },
  nullable_list_of_unions: [{
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  }, {
    type: "email",
    email_address: "emailAddress",
    subject: "subject",
    html_content: "htmlContent"
  }],
  optional_map_of_enums: {
    optionalMapOfEnums: "ADMIN"
  }
)
