require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.params.get_with_path_and_query({
  param:'param',
  query:'query'
});
