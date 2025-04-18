```typescript
import { SeedBearerTokenEnvironmentVariableClient } from "@fern/bearer-token-environment-variable";

const client = new SeedBearerTokenEnvironmentVariableClient({
  environment: "YOUR_BASE_URL",
  apiKey: "YOUR_TOKEN",
});
await client.service.getWithBearerToken();

```


