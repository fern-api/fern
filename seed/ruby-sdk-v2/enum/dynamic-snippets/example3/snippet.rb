require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.path_param.send_();
