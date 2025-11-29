require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.inlined_request.send_();
