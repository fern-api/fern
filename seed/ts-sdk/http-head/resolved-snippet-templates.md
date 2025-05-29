```typescript
import { SeedHttpHeadClient } from "@fern/http-head";

const client = new SeedHttpHeadClient({ environment: "YOUR_BASE_URL" });
await client.user.list({
  limit: 1,
});

```


