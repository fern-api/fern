```typescript
import { SeedApiClient } from "@fern/multiple-request-bodies";

const client = new SeedApiClient({ token: "YOUR_TOKEN" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/multiple-request-bodies";

const client = new SeedApiClient({ token: "YOUR_TOKEN" });
await client.uploadJsonDocument({
  author: "author",
  tags: ["tags", "tags"],
  title: "title",
});

```


