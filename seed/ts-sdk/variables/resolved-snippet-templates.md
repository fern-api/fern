```typescript
import { SeedVariablesClient } from "@fern/variables";

const client = new SeedVariablesClient({ environment: "YOUR_BASE_URL" });
await client.service.post("test-value");

```


```typescript
import { SeedVariablesClient } from "@fern/variables";

const client = new SeedVariablesClient({ environment: "YOUR_BASE_URL" });
await client.service.post("endpointParam");

```


