```typescript
import { SeedContentTypesClient } from "@fern/content-type";

const client = new SeedContentTypesClient({ environment: "YOUR_BASE_URL" });
await client.service.patch({
  application: "application",
  requireAuth: true,
});

```


