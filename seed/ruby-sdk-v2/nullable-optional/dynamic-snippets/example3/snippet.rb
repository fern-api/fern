require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.list_users(
  limit: 1,
  offset: 1,
  includeDeleted: true,
  sortBy: 'sortBy'
);
