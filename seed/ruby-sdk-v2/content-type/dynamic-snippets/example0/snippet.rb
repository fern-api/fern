require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.patch(
  application: 'application',
  requireAuth: true
);
