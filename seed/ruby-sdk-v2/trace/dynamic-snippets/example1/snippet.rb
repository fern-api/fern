require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.update_test_submission_status(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',

);
