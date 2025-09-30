require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable.delete_user(username: 'xy');
