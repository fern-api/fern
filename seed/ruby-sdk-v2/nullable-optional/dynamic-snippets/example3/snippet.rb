require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.list_users(
  limit: 1,
  offset: 1,
  include_deleted: true,
  sort_by: 'sortBy'
);
