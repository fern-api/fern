require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.foo.find(
  optionalString: 'optionalString',
  publicProperty: 'publicProperty',
  privateProperty: 1
);
