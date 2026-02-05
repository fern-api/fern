require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.get(type_id: 'typeId');
