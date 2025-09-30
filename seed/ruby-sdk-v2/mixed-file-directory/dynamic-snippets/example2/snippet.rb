require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.user.events.list_events(limit: 1);
