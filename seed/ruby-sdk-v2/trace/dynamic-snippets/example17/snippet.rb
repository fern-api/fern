require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.update_playlist({
  name: 'name',
  problems: ['problems', 'problems']
});
