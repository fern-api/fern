```typescript
import { SeedVersionClient } from "@fern/version-no-default";

const client = new SeedVersionClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("userId");

```


