```typescript
import { SeedObjectsWithImportsClient } from "@fern/optional";

const client = new SeedObjectsWithImportsClient({ environment: "YOUR_BASE_URL" });        
await client.optional.sendOptionalBody(
	{
		{
			"jsonExample": {"string":{"key":"value"}},
			"shape": {"container":{"optional":{"jsonExample":{"string":{"key":"value"}},"shape":{"container":{"map":[{"key":{"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"}},"value":{"jsonExample":{"key":"value"},"shape":{"unknown":{"key":"value"},"type":"unknown"}}}],"keyType":{"primitive":{"v1":"STRING","v2":{"type":"string"}},"type":"primitive"},"valueType":{"type":"unknown"},"type":"map"},"type":"container"}},"valueType":{"container":{"keyType":{"primitive":{"v1":"STRING","v2":{"type":"string"}},"type":"primitive"},"valueType":{"type":"unknown"},"type":"map"},"type":"container"},"type":"optional"},"type":"container"},
			"type": "reference",
			"_visit": 
		}
	}
)
 
```                        


