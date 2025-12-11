require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.optional.send_optional_nullable_with_all_optional_properties(
  action_id: 'actionId',
  id: 'id',
  request: {
    update_draft: true
  }
);
