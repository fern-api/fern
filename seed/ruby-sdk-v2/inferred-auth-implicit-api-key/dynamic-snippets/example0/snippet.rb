require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.auth.get_token(api_key: 'api_key');
