require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.update_user(user_id: 'user_id');
