require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.delete_playlist(
  1,
  'playlist_id'
);
