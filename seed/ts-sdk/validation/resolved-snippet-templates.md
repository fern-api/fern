```typescript
import { SeedValidationClient } from "@fern/validation";

const client = new SeedValidationClient({ environment: "YOUR_BASE_URL" });
undefined;
 
```                        


```typescript
import { SeedValidationClient } from "@fern/validation";

const client = new SeedValidationClient({ environment: "YOUR_BASE_URL" });
await client.get({
  decimal: 1.1,
  even: 1,
  name: "string",
});
 
```                        


