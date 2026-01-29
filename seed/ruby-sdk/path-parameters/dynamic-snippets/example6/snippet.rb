require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.search_users(
  user_id: 'user_id',
  limit: 1
);
