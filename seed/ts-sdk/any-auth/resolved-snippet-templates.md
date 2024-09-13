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
  clientId: "string",
  clientSecret: "string",
  scope: "string",
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


