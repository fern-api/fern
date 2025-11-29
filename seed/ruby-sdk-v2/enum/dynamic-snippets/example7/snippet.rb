require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.query_param.send_list();
