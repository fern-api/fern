```typescript
import { SeedAuthEnvironmentVariablesClient } from "@fern/auth-environment-variables";

const client = new SeedAuthEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  apiKey: "YOUR_AUTHORIZATION",
});
await client.service.getWithApiKey();

```


```typescript
import { SeedAuthEnvironmentVariablesClient } from "@fern/auth-environment-variables";

const client = new SeedAuthEnvironmentVariablesClient({ environment: "YOUR_BASE_URL", apiKey: "YOUR_AUTHORIZATION" });        
await client.service.getWithHeader(
	{
		X-Endpoint-Header: "X-Endpoint-Header"
	}
)

```


