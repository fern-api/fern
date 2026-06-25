require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.update_user(
  user_id: "userId",
  email: "email",
  email_verified: true,
  username: "username",
  phone_number: "phone_number",
  phone_verified: true,
  user_metadata: {
    user_metadata: {
      key: "value"
    }
  },
  app_metadata: {
    app_metadata: {
      key: "value"
    }
  },
  password: "password",
  blocked: true
)
