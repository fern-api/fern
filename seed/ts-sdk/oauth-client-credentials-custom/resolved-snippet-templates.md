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
  entityId: "entity_id",
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
  clientId: "client_id",
  clientSecret: "client_secret",
  refreshToken: "refresh_token",
  scope: "scope",
});

```


