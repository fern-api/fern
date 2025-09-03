require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.homepage.set_homepage_problems();
