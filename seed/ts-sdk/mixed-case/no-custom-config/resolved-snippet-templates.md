```typescript
import { SeedMixedCaseClient } from "@fern/mixed-case";

const client = new SeedMixedCaseClient({ environment: "YOUR_BASE_URL" });
await client.service.getResource("rsc-xyz");

```


```typescript
import { SeedMixedCaseClient } from "@fern/mixed-case";

const client = new SeedMixedCaseClient({ environment: "YOUR_BASE_URL" });
await client.service.getResource("ResourceID");

```


```typescript
import { SeedMixedCaseClient } from "@fern/mixed-case";

const client = new SeedMixedCaseClient({ environment: "YOUR_BASE_URL" });
await client.service.listResources({
  pageLimit: 10,
  beforeDate: "2023-01-01",
});

```


```typescript
import { SeedMixedCaseClient } from "@fern/mixed-case";

const client = new SeedMixedCaseClient({ environment: "YOUR_BASE_URL" });
await client.service.listResources({
  pageLimit: 1,
  beforeDate: "2023-01-15",
});

```


