require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.events.metadata.get_metadata(id: 'id');
