require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.property_based_error.throw_error();
