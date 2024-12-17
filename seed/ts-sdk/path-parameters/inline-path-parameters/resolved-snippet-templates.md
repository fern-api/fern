```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganization("tenant_id", "organization_id");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganizationUser(
  "tenant_id",
  "organization_id",
  "user_id"
);
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.searchOrganizations("tenant_id", "organization_id", {
  limit: 1,
});
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.getUser("tenant_id", "user_id");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.searchUsers("tenant_id", "user_id", {
  limit: 1,
});
 
```                        


