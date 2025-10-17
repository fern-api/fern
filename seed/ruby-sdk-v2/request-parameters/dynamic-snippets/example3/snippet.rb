require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_username_optional({
  username: 'username',
  password: 'password',
  name: 'test'
});
