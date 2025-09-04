require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.container.get_and_return_map_prim_to_prim({
  string:'string'
});
