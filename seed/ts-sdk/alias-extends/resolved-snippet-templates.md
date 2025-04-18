```typescript
import { SeedAliasExtendsClient } from "@fern/alias-extends";

const client = new SeedAliasExtendsClient({ environment: "YOUR_BASE_URL" });
await client.extendedInlineRequestBody({
  child: "child",
});

```


