require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.send_workspace_submission_update(
  'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  {
    update_time: '2024-01-15T09:30:00Z'
  }
);
