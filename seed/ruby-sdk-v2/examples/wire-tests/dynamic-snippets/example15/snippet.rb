require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.create_movie({
  id: 'movie-c06a4ad7',
  prequel: 'movie-cv9b914f',
  title: 'The Boy and the Heron',
  from: 'Hayao Miyazaki',
  rating: 8,
  type: 'movie',
  tag: 'tag-wf9as23d',
  metadata: {},
  revenue: 1000000
});
