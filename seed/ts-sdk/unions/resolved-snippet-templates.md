```typescript
import { SeedUnionsClient } from "@fern/unions";

const client = new SeedUnionsClient({ environment: "YOUR_BASE_URL" });
await client.bigunion.get("id");

```


```typescript
import { SeedUnionsClient } from "@fern/unions";

const client = new SeedUnionsClient({ environment: "YOUR_BASE_URL" });        
await client.bigunion.update(
	{
		{ 
			type : "normalSweet", 
			value: "value"
		}
	}
)

```


```typescript
import { SeedUnionsClient } from "@fern/unions";

const client = new SeedUnionsClient({ environment: "YOUR_BASE_URL" });        
await client.bigunion.updateMany(
	{
		[
			{ 
				type : "normalSweet", 
				value: "value"
			},
			{ 
				type : "normalSweet", 
				value: "value"
			}
		]
	}
)

```


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


