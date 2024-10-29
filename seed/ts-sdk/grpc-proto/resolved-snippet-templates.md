```typescript
import { SeedApiClient } from "@fern/grpc-proto";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;
 
```                        


```typescript
import { SeedApiClient } from "@fern/grpc-proto";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.userservice.create({
  username: "username",
  email: "email",
  age: 1,
  weight: 1.1,
});
 
```                        


