```typescript
import { SeedObjectsWithImportsClient } from "@fern/optional";

const client = new SeedObjectsWithImportsClient({ environment: "YOUR_BASE_URL" });        
await client.optional.sendOptionalBody(
	{
		{
			"string": {"key":"value"}
		}
	}
)

```


```typescript
import { SeedObjectsWithImportsClient } from "@fern/optional";

const client = new SeedObjectsWithImportsClient({
  environment: "YOUR_BASE_URL",
});
await client.optional.sendOptionalTypedBody({
  message: "message",
});

```


