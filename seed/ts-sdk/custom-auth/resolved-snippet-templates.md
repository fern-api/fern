```typescript
import { SeedCustomAuthClient } from "@fern/custom-auth";

const client = new SeedCustomAuthClient({
  environment: "YOUR_BASE_URL",
  customAuthScheme: "YOUR_AUTHORIZATION",
});
await client.customAuth.getWithCustomAuth();

```


```typescript
import { SeedCustomAuthClient } from "@fern/custom-auth";

const client = new SeedCustomAuthClient({ environment: "YOUR_BASE_URL", customAuthScheme: "YOUR_AUTHORIZATION" });        
await client.customAuth.postWithCustomAuth(
	{
		{"key":"value"}
	}
)

```


