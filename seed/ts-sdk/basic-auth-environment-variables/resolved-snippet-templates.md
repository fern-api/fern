```typescript
import { SeedBasicAuthEnvironmentVariablesClient } from "@fern/basic-auth-environment-variables";

const client = new SeedBasicAuthEnvironmentVariablesClient({
  environment: "YOUR_BASE_URL",
  username: "YOUR_USERNAME",
  accessToken: "YOUR_PASSWORD",
});
await client.basicAuth.getWithBasicAuth();

```


```typescript
import { SeedBasicAuthEnvironmentVariablesClient } from "@fern/basic-auth-environment-variables";

const client = new SeedBasicAuthEnvironmentVariablesClient({ environment: "YOUR_BASE_URL", username: "YOUR_USERNAME", accessToken: "YOUR_PASSWORD" });        
await client.basicAuth.postWithBasicAuth(
	{
		{"key":"value"}
	}
)

```


