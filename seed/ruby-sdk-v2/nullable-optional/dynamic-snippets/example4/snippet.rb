require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.search_users(
  query: 'query',
  department: 'department',
  role: 'role',
  isActive: true
);
