require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.union.nested_unions(request: 'string');
