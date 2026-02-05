require "seed"

client = Seed::Client.new(
  client_id: '<clientId>',
  client_secret: '<clientSecret>',
  base_url: 'https://api.fern.com'
);

client.auth.get_token_with_client_credentials(
  cid: 'cid',
  csr: 'csr',
  scp: 'scp',
  entity_id: 'entity_id',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
  scope: 'scope'
);
