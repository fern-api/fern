require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.send_workspace_submission_update({
  updateTime: '2024-01-15T09:30:00Z'
});
