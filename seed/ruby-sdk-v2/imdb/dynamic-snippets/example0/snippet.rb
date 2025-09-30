require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.imdb.create_movie({
  title: 'title',
  rating: 1.1
});
