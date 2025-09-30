require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.get_playlists(
  serviceParam: 1,
  limit: 1,
  otherField: 'otherField',
  multiLineDocs: 'multiLineDocs',
  optionalMultipleField: ,
  multipleField: 
);
