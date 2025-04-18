```typescript
import { SeedServerSentEventsClient } from "@fern/server-sent-events";

const client = new SeedServerSentEventsClient({ environment: "YOUR_BASE_URL" });
await client.completions.stream({
  query: "query",
});

```


