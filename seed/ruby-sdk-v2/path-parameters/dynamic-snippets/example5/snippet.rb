require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.user.update_user({
  userId:'user_id'
});
