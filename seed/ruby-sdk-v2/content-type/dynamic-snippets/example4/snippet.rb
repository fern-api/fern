require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.regular_patch(
  id: 'id',
  field_1: 'field1',
  field_2: 1
);
