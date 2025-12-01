require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable.get_users(
  avatar: 'avatar',
  extra: true
);
