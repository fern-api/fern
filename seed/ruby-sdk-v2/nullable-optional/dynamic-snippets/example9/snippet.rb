require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.filter_by_role();
