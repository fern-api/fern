require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_username_optional(request: {
  username: 'username',
  password: 'password',
  name: 'test'
});
