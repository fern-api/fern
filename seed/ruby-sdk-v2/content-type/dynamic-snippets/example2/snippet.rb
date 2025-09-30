require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.named_patch_with_mixed(
  id: 'id',
  appId: 'appId',
  instructions: 'instructions',
  active: true
);
