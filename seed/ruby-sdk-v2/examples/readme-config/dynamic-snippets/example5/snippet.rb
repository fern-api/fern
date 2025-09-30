require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.service.get_file(
  filename: 'file.txt',
  xFileApiVersion: '0.0.2'
);
