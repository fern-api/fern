require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.get_playlist(
  service_param: 1,
  playlist_id: 'playlistId'
);
