```typescript
import { SeedMultiLineDocsClient } from "@fern/multi-line-docs";

const client = new SeedMultiLineDocsClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("userId");

```


```typescript
import { SeedMultiLineDocsClient } from "@fern/multi-line-docs";

const client = new SeedMultiLineDocsClient({ environment: "YOUR_BASE_URL" });
await client.user.createUser({
  name: "name",
  age: 1,
});

```


