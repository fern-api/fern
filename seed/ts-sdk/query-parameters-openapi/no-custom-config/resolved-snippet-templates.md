```typescript
import { SeedApiClient } from "@fern/query-parameters-openapi";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/query-parameters-openapi";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.search({
  filter: {
    name: "name",
    age: 1,
    location: {
      city: "city",
      country: "country",
      coordinates: {
        latitude: 1.1,
        longitude: 1.1,
      },
    },
  },
  limit: 100,
  tags: "tags",
});

```


