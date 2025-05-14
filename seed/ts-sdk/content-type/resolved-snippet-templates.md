```typescript
import { SeedContentTypesClient } from "@fern/content-type";

const client = new SeedContentTypesClient({ environment: "YOUR_BASE_URL" });
await client.service.patch({
  application: "application",
  require_auth: true,
});

```


