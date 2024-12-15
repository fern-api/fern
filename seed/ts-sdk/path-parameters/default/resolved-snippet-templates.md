```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganization("tenantId", "organizationId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganizationUser(
  "tenantId",
  "organizationId",
  "userId"
);
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.searchOrganizations("tenantId", "organizationId", {
  limit: 1,
});
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("tenantId", "userId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.searchUsers("tenantId", "userId", {
  limit: 1,
});
 
```                        


