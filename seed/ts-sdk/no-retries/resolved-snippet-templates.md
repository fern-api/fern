```typescript
import { SeedNoRetriesClient } from "@fern/no-retries";

const client = new SeedNoRetriesClient({ environment: "YOUR_BASE_URL" });
await client.retries.getUsers();

```


