```typescript
import { SeedQueryParametersClient } from "@fern/query-parameters";

const client = new SeedQueryParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getUsername({
  limit: 1,
  id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  date: "2023-01-15",
  deadline: "2024-01-15T09:30:00Z",
  bytes: "SGVsbG8gd29ybGQh",
  user: {
    name: "string",
    tags: ["string"],
  },
  userList: [
    {
      name: "string",
    },
  ],
  optionalDeadline: "2024-01-15T09:30:00Z",
  keyValue: {
    string: "string",
  },
  optionalString: "string",
  nestedUser: {
    name: "string",
    user: {
      name: "string",
      tags: ["string"],
    },
  },
  optionalUser: {
    name: "string",
    tags: ["string"],
  },
  excludeUser: {
    name: "string",
    tags: ["string"],
  },
  filter: "string",
});
 
```                        


