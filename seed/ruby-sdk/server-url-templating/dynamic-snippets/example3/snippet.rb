require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get_user(user_id: 'userId');
