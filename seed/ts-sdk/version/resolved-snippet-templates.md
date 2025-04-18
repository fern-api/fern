```typescript
import { SeedVersionClient } from "@fern/version";

const client = new SeedVersionClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("userId");

```


