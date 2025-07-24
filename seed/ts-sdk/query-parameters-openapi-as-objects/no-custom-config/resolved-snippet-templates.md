```typescript
import { SeedApiClient } from "@fern/query-parameters-openapi-as-objects";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/query-parameters-openapi-as-objects";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.search({
  limit: 100,
  after: 1,
  tags: "tags",
});

```


