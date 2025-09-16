```typescript
import { SeedPropertyAccessClient } from "@fern/property-access";

const client = new SeedPropertyAccessClient({ environment: "YOUR_BASE_URL" });
await client.createUser({
  id: "id",
  email: "email",
  password: "password",
  profile: {
    name: "name",
    verification: {
      verified: "verified",
    },
    ssn: "ssn",
  },
});

```


