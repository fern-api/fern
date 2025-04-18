```typescript
import { SeedNurseryApiClient } from "@fern/reserved-keywords";

const client = new SeedNurseryApiClient({ environment: "YOUR_BASE_URL" });
await client.package.test({
  for: "for",
});

```


