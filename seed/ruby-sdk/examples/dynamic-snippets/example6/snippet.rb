require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.service.get_file(
  filename: 'filename',
  x_file_api_version: 'X-File-API-Version'
);
