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
  entityId: 'entity_id',
  audience: 'https://api.example.com',
  grantType: 'client_credentials',
  scope: 'scope'
);
