require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.organizations.get_organization_user(
  organization_id: 'organization_id',
  user_id: 'user_id'
);
