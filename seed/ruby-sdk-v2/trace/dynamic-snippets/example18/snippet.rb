require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.update_playlist(
  1,
  'playlistId',
  {
    name: 'name',
    problems: ['problems', 'problems']
  }
);
