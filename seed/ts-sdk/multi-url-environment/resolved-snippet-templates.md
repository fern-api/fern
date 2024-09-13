```typescript
import { SeedMultiUrlEnvironmentClient } from "@fern/multi-url-environment";

const client = new SeedMultiUrlEnvironmentClient({ token: "YOUR_TOKEN" });
await client.ec2.bootInstance({
  size: "string",
});
 
```                        


```typescript
import { SeedMultiUrlEnvironmentClient } from "@fern/multi-url-environment";

const client = new SeedMultiUrlEnvironmentClient({ token: "YOUR_TOKEN" });
await client.s3.getPresignedUrl({
  s3Key: "string",
});
 
```                        


