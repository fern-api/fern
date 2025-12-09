require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.get_user_specifics(
  user_id: 'user_id',
  version: 1,
  thought: 'thought'
);
