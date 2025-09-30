require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.service.get_file(
  filename: 'filename',
  xFileApiVersion: 'X-File-API-Version'
);
