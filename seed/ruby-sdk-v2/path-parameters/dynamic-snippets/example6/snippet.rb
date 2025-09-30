require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.search_users(
  userId: 'user_id',
  limit: 1
);
