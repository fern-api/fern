```typescript
import { SeedInferredAuthImplicitClient } from "@fern/inferred-auth-implicit";

const client = new SeedInferredAuthImplicitClient({ environment: "YOUR_BASE_URL" });        
await client.auth.getTokenWithClientCredentials(
	{
		X-Api-Key: "X-Api-Key",
		client_id: "client_id",
		client_secret: "client_secret",
		scope: "scope"
	}
)

```


```typescript
import { SeedInferredAuthImplicitClient } from "@fern/inferred-auth-implicit";

const client = new SeedInferredAuthImplicitClient({ environment: "YOUR_BASE_URL" });        
await client.auth.refreshToken(
	{
		X-Api-Key: "X-Api-Key",
		client_id: "client_id",
		client_secret: "client_secret",
		refresh_token: "refresh_token",
		scope: "scope"
	}
)

```


```typescript
import { SeedInferredAuthImplicitClient } from "@fern/inferred-auth-implicit";

const client = new SeedInferredAuthImplicitClient({
  environment: "YOUR_BASE_URL",
});
await client.nestedNoAuth.api.getSomething();

```


```typescript
import { SeedInferredAuthImplicitClient } from "@fern/inferred-auth-implicit";

const client = new SeedInferredAuthImplicitClient({
  environment: "YOUR_BASE_URL",
});
await client.nested.api.getSomething();

```


```typescript
import { SeedInferredAuthImplicitClient } from "@fern/inferred-auth-implicit";

const client = new SeedInferredAuthImplicitClient({
  environment: "YOUR_BASE_URL",
});
await client.simple.getSomething();

```


