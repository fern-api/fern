require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.create_test(
  normal_field: 'normalField',
  nullable_field: 'nullableField'
);
