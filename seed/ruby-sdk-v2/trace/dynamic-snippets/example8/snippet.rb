require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.store_traced_workspace_v_2();
