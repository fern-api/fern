```typescript
import { SeedOauthClientCredentialsClient } from "@fern/oauth-client-credentials-nested-root";

const client = new SeedOauthClientCredentialsClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getToken({
  clientId: "client_id",
  clientSecret: "client_secret",
  scope: "scope",
});

```


