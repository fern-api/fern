require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.create_user(
  email: 'email',
  email_verified: true,
  username: 'username',
  password: 'password',
  phone_number: 'phone_number',
  phone_verified: true,
  user_metadata: {},
  app_metadata: {},
  connection: 'connection'
);
