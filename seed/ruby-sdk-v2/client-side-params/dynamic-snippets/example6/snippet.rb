require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.update_user(
  'userId',
  {
    email: 'email',
    email_verified: true,
    username: 'username',
    phone_number: 'phone_number',
    phone_verified: true,
    user_metadata: {},
    app_metadata: {},
    password: 'password',
    blocked: true
  }
);
