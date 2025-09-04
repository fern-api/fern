require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.query_param.send_list({});
