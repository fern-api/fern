```typescript
import { SeedApiClient } from "@fern/simple-fhir";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.getAccount("account_id");

```


