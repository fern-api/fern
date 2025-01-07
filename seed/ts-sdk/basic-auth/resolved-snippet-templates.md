```typescript
import { SeedBasicAuthClient } from "@fern/basic-auth";

const client = new SeedBasicAuthClient({
  environment: "YOUR_BASE_URL",
  username: "YOUR_USERNAME",
  password: "YOUR_PASSWORD",
});
await client.basicAuth.getWithBasicAuth();

```


```typescript
import { SeedBasicAuthClient } from "@fern/basic-auth";

const client = new SeedBasicAuthClient({ environment: "YOUR_BASE_URL", username: "YOUR_USERNAME", password: "YOUR_PASSWORD" });        
await client.basicAuth.postWithBasicAuth(
	{
		{"key":"value"}
	}
)

```


