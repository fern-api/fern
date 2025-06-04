```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials-custom";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getTokenWithClientCredentials({
  cid: "cid",
  csr: "csr",
  scp: "scp",
  entity_id: "entity_id",
  scope: "scope",
});

```


```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials-custom";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.refreshToken({
  client_id: "client_id",
  client_secret: "client_secret",
  refresh_token: "refresh_token",
  scope: "scope",
});

```


