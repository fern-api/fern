require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.get_user_metadata(
  userId: 'user_id',
  version: 1
);
