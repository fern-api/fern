require "fernexamples"

client = FernExamples::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_movie(movie_id: 'movie-c06a4ad7');
