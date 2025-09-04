require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.folder_a.service.get_direct_thread();
