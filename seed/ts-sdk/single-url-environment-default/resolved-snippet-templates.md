```typescript
import { SeedSingleUrlEnvironmentDefaultClient } from "@fern/single-url-environment-default";

const client = new SeedSingleUrlEnvironmentDefaultClient({
  token: "YOUR_TOKEN",
});
await client.dummy.getDummy();

```


