```typescript
import { SeedObjectClient } from "@fern/inline-types";

const client = new SeedObjectClient({ environment: "YOUR_BASE_URL" });
await client.getRoot({
  bar: {
    foo: "foo",
    bar: {
      foo: "foo",
      bar: "bar",
    },
  },
  foo: "foo",
});
 
```                        


