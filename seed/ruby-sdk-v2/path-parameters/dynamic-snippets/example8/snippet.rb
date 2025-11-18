require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.get_user_specifics(
  userId: 'user_id',
  version: 1,
  thought: 'thought'
);
