```typescript
import { SeedUnknownAsAnyClient } from "@fern/unknown";

const client = new SeedUnknownAsAnyClient({ environment: "YOUR_BASE_URL" });        
await client.unknown.post(
	{
		{"jsonExample":{"key":"value"},"shape":{"unknown":{"key":"value"},"type":"unknown"},"type":"reference"}
	}
)
 
```                        


```typescript
import { SeedUnknownAsAnyClient } from "@fern/unknown";

const client = new SeedUnknownAsAnyClient({ environment: "YOUR_BASE_URL" });
undefined;
 
```                        


