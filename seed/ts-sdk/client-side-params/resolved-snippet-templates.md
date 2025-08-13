```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({ environment: "YOUR_BASE_URL" });
await client.service.listResources({
  page: 1,
  per_page: 1,
  sort: "created_at",
  order: "desc",
  include_totals: true,
  fields: "fields",
  search: "search",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({ environment: "YOUR_BASE_URL" });
await client.service.getResource("resourceId", {
  include_metadata: true,
  format: "json",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({ environment: "YOUR_BASE_URL" });
await client.service.searchResources({
  limit: 1,
  offset: 1,
  query: "query",
  filters: {
    filters: { key: "value" },
  },
});

```


