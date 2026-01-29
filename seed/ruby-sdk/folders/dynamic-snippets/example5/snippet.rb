require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.folder.service.unknown_request();
