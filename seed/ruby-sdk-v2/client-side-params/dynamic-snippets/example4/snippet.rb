require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.get_user_by_id(
  userId: 'userId',
  fields: 'fields',
  includeFields: true
);
