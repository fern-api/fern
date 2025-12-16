require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.filter_by_role(
  role: 'ADMIN',
  status: 'active',
  secondary_role: 'ADMIN'
);
