require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.object.get_and_return_with_map_of_map(map: {
  map: {
    map: 'map'
  }
});
