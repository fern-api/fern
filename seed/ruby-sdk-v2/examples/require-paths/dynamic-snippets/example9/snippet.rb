require "fernexamples"

client = FernExamples::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.health.service.check(id: 'id-3tey93i');
