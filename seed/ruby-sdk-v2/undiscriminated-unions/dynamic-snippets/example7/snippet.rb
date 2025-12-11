require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.union.duplicate_types_union(request: 'string');
