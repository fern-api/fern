```typescript
import { SeedStreamingClient } from "@fern/streaming";

const client = new SeedStreamingClient({ environment: "YOUR_BASE_URL" });
await client.dummy.generateStream({
  num_events: 1,
});

```


```typescript
import { SeedStreamingClient } from "@fern/streaming";

const client = new SeedStreamingClient({ environment: "YOUR_BASE_URL" });
await client.dummy.generate({
  num_events: 5,
});

```


```typescript
import { SeedStreamingClient } from "@fern/streaming";

const client = new SeedStreamingClient({ environment: "YOUR_BASE_URL" });
await client.dummy.generate({
  num_events: 1,
});

```


