```typescript
import { SeedNoEnvironmentClient } from "@fern/no-environment";

const client = new SeedNoEnvironmentClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.dummy.getDummy();

```


