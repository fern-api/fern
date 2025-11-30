require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.create_playlist(
  service_param: 1,
  datetime: '2024-01-15T09:30:00Z',
  optional_datetime: '2024-01-15T09:30:00Z'
);
