require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nested_no_auth.api.get_something();
