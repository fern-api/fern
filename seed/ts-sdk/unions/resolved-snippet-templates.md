```typescript
import { SeedUnionsClient } from "@fern/unions";

const client = new SeedUnionsClient({ environment: "YOUR_BASE_URL" });
await client.union.get("id");

```


```typescript
import { SeedUnionsClient } from "@fern/unions";

const client = new SeedUnionsClient({ environment: "YOUR_BASE_URL" });        
await client.union.update(
	{
		{ 
			type : "circle", 
			radius: 1.1
		}
	}
)

```


