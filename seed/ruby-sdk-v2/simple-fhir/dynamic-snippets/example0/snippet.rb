require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get_account('account_id');
