require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.foo.find(
  optional_string: 'optionalString',
  public_property: 'publicProperty',
  private_property: 1
);
