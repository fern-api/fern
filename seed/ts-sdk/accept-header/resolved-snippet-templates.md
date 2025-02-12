```typescript
import { SeedAcceptClient } from "@fern/accept-header";

const client = new SeedAcceptClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.endpoint();

```


