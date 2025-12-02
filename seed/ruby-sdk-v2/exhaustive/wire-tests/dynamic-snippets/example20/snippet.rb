require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.object.get_and_return_nested_with_required_field_as_list();
