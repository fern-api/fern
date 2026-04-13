require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.updatecomplexprofile(
  profile_id: "profileId",
  nullable_role: "ADMIN",
  nullable_status: "active",
  nullable_notification: {
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
  nullable_array: %w[nullableArray nullableArray]
)
