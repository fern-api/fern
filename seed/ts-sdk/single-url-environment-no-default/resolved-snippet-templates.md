```typescript
import { SeedSingleUrlEnvironmentNoDefaultClient } from "@fern/single-url-environment-no-default";

const client = new SeedSingleUrlEnvironmentNoDefaultClient({
  environment: SeedSingleUrlEnvironmentNoDefaultEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.dummy.getDummy();

```


