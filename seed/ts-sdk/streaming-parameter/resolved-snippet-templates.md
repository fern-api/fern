```typescript
import { SeedStreamingClient } from "@fern/streaming-parameter";

const client = new SeedStreamingClient({ environment: "YOUR_BASE_URL" });
await client.dummy.generate({
  stream: false,
  num_events: 5,
});

```


```typescript
import { SeedStreamingClient } from "@fern/streaming-parameter";

const client = new SeedStreamingClient({ environment: "YOUR_BASE_URL" });
await client.dummy.generate({
  stream: true,
  num_events: 1,
});

```


