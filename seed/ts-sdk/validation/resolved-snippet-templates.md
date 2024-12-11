```typescript
import { SeedValidationClient } from "@fern/validation";

const client = new SeedValidationClient({ environment: "YOUR_BASE_URL" });
await client.create({
  decimal: 2.2,
  even: 100,
  name: "foo",
});
 
```                        


```typescript
import { SeedValidationClient } from "@fern/validation";

const client = new SeedValidationClient({ environment: "YOUR_BASE_URL" });
await client.get({
  decimal: 2.2,
  even: 100,
  name: "foo",
});
 
```                        


