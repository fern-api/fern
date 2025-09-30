require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.organizations.get_organization_user(
  organizationId: 'organization_id',
  userId: 'user_id'
);
