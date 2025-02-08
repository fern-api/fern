```typescript
import { SeedExamplesClient } from "@fern/examples-minimal";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getMovie({
  cast: ["cast", "cast"],
});

```


```typescript
import { SeedExamplesClient } from "@fern/examples-minimal";

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.service.createBigEntity(
	{
		{ 
			type : "and", 
			value: true
		}
	}
)

```


