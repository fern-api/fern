```typescript
import { SeedSimpleApiClient } from "@fern-api/dummy";

const client = new SeedSimpleApiClient({
  environment: SeedSimpleApiEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.user.get("id");

```


