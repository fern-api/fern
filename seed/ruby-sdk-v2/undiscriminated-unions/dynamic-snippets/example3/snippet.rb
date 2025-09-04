require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.union.update_metadata();
