require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.notification.service.get_exception();
