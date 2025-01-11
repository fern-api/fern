```typescript
import { SeedMultiUrlEnvironmentNoDefaultClient } from "@fern/multi-url-environment-no-default";

const client = new SeedMultiUrlEnvironmentNoDefaultClient({
  environment: SeedMultiUrlEnvironmentNoDefaultEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.ec2.bootInstance({
  size: "size",
});

```


```typescript
import { SeedMultiUrlEnvironmentNoDefaultClient } from "@fern/multi-url-environment-no-default";

const client = new SeedMultiUrlEnvironmentNoDefaultClient({
  environment: SeedMultiUrlEnvironmentNoDefaultEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.s3.getPresignedUrl({
  s3Key: "s3Key",
});

```


