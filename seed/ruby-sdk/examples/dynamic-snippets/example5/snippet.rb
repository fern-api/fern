require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.service.get_file(
  filename: 'file.txt',
  x_file_api_version: '0.0.2'
);
