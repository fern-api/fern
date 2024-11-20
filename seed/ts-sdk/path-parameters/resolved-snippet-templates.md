```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getOrganization("organizationId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("userId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getOrganizationUser("organizationId", "userId");
 
```                        


