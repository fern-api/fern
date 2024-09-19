```typescript
import { SeedApiClient } from "@fern/grpc";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.user.createUser({
  username: "string",
  email: "string",
  age: 1,
  weight: 1.1,
});
 
```                        


```typescript
import { SeedApiClient } from "@fern/grpc";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser({
  username: "string",
  age: 1,
  weight: 1.1,
});
 
```                        


