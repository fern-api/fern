require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.bigunion.update_many();
