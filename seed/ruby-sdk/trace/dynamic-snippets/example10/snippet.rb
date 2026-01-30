require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.homepage.set_homepage_problems(request: ['string', 'string']);
