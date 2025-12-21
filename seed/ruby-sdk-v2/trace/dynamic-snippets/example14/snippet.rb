require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.get_playlist(
  1,
  'playlistId'
);
