```typescript
import { SeedApiClient } from "@fern/required-nullable";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.getFoo({
  required_baz: "required_baz",
  required_nullable_baz: "required_nullable_baz",
});

```


```typescript
import { SeedApiClient } from "@fern/required-nullable";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.getFoo({
  optional_baz: "optional_baz",
  optional_nullable_baz: "optional_nullable_baz",
  required_baz: "required_baz",
  required_nullable_baz: "required_nullable_baz",
});

```


```typescript
import { SeedApiClient } from "@fern/required-nullable";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });        
await client.updateFoo(
	"id",
	{
		X-Idempotency-Key: "X-Idempotency-Key",
		nullable_text: "nullable_text",
		nullable_number: 1.1,
		non_nullable_text: "non_nullable_text"
	}
)

```


