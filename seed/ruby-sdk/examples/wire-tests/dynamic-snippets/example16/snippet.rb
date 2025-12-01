require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.create_movie({
  id: 'id',
  prequel: 'prequel',
  title: 'title',
  from: 'from',
  rating: 1.1,
  type: 'movie',
  tag: 'tag',
  book: 'book',
  metadata: {},
  revenue: 1000000
});
