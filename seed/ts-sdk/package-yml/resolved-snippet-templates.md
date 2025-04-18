```typescript
import { SeedPackageYmlClient } from "@fern/package-yml";

const client = new SeedPackageYmlClient({ environment: "YOUR_BASE_URL" });
await client.echo("id-ksfd9c1", {
  name: "Hello world!",
  size: 20,
});

```


```typescript
import { SeedPackageYmlClient } from "@fern/package-yml";

const client = new SeedPackageYmlClient({ environment: "YOUR_BASE_URL" });
await client.echo("id", {
  name: "name",
  size: 1,
});

```


```typescript
import { SeedPackageYmlClient } from "@fern/package-yml";

const client = new SeedPackageYmlClient({ environment: "YOUR_BASE_URL" });
await client.service.nop("id-a2ijs82", "id-219xca8");

```


```typescript
import { SeedPackageYmlClient } from "@fern/package-yml";

const client = new SeedPackageYmlClient({ environment: "YOUR_BASE_URL" });
await client.service.nop("id", "nestedId");

```


