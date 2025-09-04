require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.playlist.create_playlist({
  serviceParam:1,
  datetime:'2024-01-15T09:30:00Z',
  optionalDatetime:'2024-01-15T09:30:00Z'
});
