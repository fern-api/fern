require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_user(
  name: 'Alice',
  type: 'CreateUserRequest',
  version: 'v1'
);
