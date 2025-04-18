```typescript
import { SeedObjectClient } from "@fern/ts-inline-types";

const client = new SeedObjectClient({ environment: "YOUR_BASE_URL" });
await client.getRoot({
  bar: {
    foo: "foo",
  },
  foo: "foo",
});

```


```typescript
import { SeedObjectClient } from "@fern/ts-inline-types";

const client = new SeedObjectClient({ environment: "YOUR_BASE_URL" });        
await client.getDiscriminatedUnion(
	{
		bar: bar: { 
			type : "type1", 
			foo: "foo",
			bar: {
					foo: "foo",
					ref: {
						foo: "foo"
					}
				},
			ref: {
					foo: "foo"
				}
		},
		foo: "foo"
	}
)

```


```typescript
import { SeedObjectClient } from "@fern/ts-inline-types";

const client = new SeedObjectClient({ environment: "YOUR_BASE_URL" });
await client.getUndiscriminatedUnion({
  foo: "foo",
});

```


