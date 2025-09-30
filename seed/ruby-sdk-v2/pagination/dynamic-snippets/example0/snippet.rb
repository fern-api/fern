require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.complex.search({
  pagination: {
    per_page: 1,
    starting_after: 'starting_after'
  }
});
