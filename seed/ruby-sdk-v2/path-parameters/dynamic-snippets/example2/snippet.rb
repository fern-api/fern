require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.organizations.search_organizations(
  organization_id: 'organization_id',
  limit: 1
);
