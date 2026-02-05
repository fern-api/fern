require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_username_with_referenced_type(
  tags: ['tags', 'tags'],
  username: 'username',
  password: 'password',
  name: 'test'
);
