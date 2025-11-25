require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.get_resource('rsc-xyz');
