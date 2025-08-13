```typescript
import { SeedContentTypesClient } from "@fern/content-type";

const client = new SeedContentTypesClient({ environment: "YOUR_BASE_URL" });
await client.service.patch({
  application: "application",
  require_auth: true,
});

```


```typescript
import { SeedContentTypesClient } from "@fern/content-type";

const client = new SeedContentTypesClient({ environment: "YOUR_BASE_URL" });
await client.service.patchComplex("id", {
  name: "name",
  age: 1,
  active: true,
  metadata: {
    metadata: { key: "value" },
  },
  tags: ["tags", "tags"],
  email: "email",
  nickname: "nickname",
  bio: "bio",
  profileImageUrl: "profileImageUrl",
  settings: {
    settings: { key: "value" },
  },
});

```


```typescript
import { SeedContentTypesClient } from "@fern/content-type";

const client = new SeedContentTypesClient({ environment: "YOUR_BASE_URL" });
await client.service.regularPatch("id", {
  field1: "field1",
  field2: 1,
});

```


