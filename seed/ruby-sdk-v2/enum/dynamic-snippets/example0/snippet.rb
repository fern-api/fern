require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.headers.send_();
