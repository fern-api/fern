```typescript
import { SeedExtraPropertiesClient } from "@fern/extra-properties";

const client = new SeedExtraPropertiesClient({ environment: "YOUR_BASE_URL" });
await client.user.createUser({
  name: "name",
});

```


