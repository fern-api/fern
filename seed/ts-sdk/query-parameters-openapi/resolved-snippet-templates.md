```typescript
import { SeedApiClient } from "@fern/query-parameters-openapi";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.search({
  limit: 1,
  id: "id",
  date: "date",
  deadline: "2024-01-15T09:30:00Z",
  bytes: "bytes",
  user: {
    name: "name",
    tags: ["tags", "tags"],
  },
  userList: {
    name: "name",
    tags: ["tags", "tags"],
  },
  optionalDeadline: "2024-01-15T09:30:00Z",
  keyValue: {
    keyValue: "keyValue",
  },
  optionalString: "optionalString",
  nestedUser: {
    name: "name",
    user: {
      name: "name",
      tags: ["tags", "tags"],
    },
  },
  optionalUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  excludeUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  filter: "filter",
  neighbor: {
    name: "name",
    tags: ["tags", "tags"],
  },
});

```


