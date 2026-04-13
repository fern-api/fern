require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.nullableoptional.createcomplexprofile(
  id: "id",
  nullable_role: "ADMIN",
  nullable_status: "active",
  nullable_notification: {
    email_address: "emailAddress",
    subject: "subject",
    type: "email"
  },
  nullable_search_result: {
    id: "id",
    username: "username",
    created_at: "2024-01-15T09:30:00Z",
    type: "user"
  }
)
