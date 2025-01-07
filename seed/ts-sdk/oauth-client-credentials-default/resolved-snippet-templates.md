```typescript
import { SeedOauthClientCredentialsDefaultClient } from "@fern/oauth-client-credentials-default";

const client = new SeedOauthClientCredentialsDefaultClient({
  environment: "YOUR_BASE_URL",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getToken({
  clientId: "client_id",
  clientSecret: "client_secret",
});

```


