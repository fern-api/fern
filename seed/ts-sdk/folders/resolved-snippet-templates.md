```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.foo();

```


```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.a.b.foo();

```


```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.a.c.foo();

```


```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.folder.foo();

```


```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.folder.service.endpoint();

```


```typescript
import { SeedApiClient } from "@fern/folders";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });        
await client.folder.service.unknownRequest(
	{
		{"key":"value"}
	}
)

```


