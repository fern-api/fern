require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.complex.search(
  'index',
  {
    pagination: {
      per_page: 1,
      starting_after: 'starting_after'
    }
  }
);
