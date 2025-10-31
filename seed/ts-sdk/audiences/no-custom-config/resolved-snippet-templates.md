```typescript
import { SeedAudiencesClient } from "@fern/audiences";

const client = new SeedAudiencesClient({
  environment: SeedAudiencesEnvironment.EnvironmentA,
});
await client.folderA.service.getDirectThread({
  ids: "ids",
  tags: "tags",
});

```


```typescript
import { SeedAudiencesClient } from "@fern/audiences";

const client = new SeedAudiencesClient({
  environment: SeedAudiencesEnvironment.EnvironmentA,
});
await client.folderD.service.getDirectThread();

```


```typescript
import { SeedAudiencesClient } from "@fern/audiences";

const client = new SeedAudiencesClient({
  environment: SeedAudiencesEnvironment.EnvironmentA,
});
await client.foo.find({
  optionalString: "optionalString",
  publicProperty: "publicProperty",
  privateProperty: 1,
});

```


