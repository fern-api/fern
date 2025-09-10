```typescript
import { SeedPaginationClient } from "@fern/pagination-custom";

const client = new SeedPaginationClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.users.listUsernamesCustom({
  starting_after: "starting_after",
});

```


