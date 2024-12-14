```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganization("organizationId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.getOrganizationUser("organizationId", "userId");
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.organizations.searchOrganizations("organizationId", {
  limit: 1,
});
 
```                        


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


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.searchUsers("userId", {
  limit: 1,
});
 
```                        


```typescript
import { SeedPathParametersClient } from "@fern/path-parameters";

const client = new SeedPathParametersClient({ environment: "YOUR_BASE_URL" });
await client.user.searchOrganizations("organizationId", {
  limit: 1,
});
 
```                        


