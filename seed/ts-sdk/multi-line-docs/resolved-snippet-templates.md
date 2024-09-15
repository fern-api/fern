```typescript
import { SeedMultiLineDocsClient } from "@fern/multi-line-docs";

const client = new SeedMultiLineDocsClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("string");
 
```                        


```typescript
import { SeedMultiLineDocsClient } from "@fern/multi-line-docs";

const client = new SeedMultiLineDocsClient({ environment: "YOUR_BASE_URL" });
await client.user.createUser({
  name: "string",
  age: 1,
});
 
```                        


