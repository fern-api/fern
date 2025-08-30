require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.folder.service.unknown_request();
