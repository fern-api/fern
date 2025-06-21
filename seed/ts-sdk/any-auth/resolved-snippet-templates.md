```typescript
import { SeedAnyAuthClient } from "@fern/any-auth";

const client = new SeedAnyAuthClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
  apiKey: "YOUR_AUTHORIZATION",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.auth.getToken({
  client_id: "client_id",
  client_secret: "client_secret",
  scope: "scope",
});

```


```typescript
import { SeedAnyAuthClient } from "@fern/any-auth";

const client = new SeedAnyAuthClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
  apiKey: "YOUR_AUTHORIZATION",
  clientId: "YOUR_AUTHORIZATION",
  clientSecret: "YOUR_AUTHORIZATION",
});
await client.user.get();

```


