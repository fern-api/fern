```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.upload({
  columns: [
    {
      id: "id",
    },
  ],
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.upload({
  columns: [
    {
      id: "id",
    },
    {
      id: "id",
    },
  ],
  namespace: "namespace",
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.delete({
  ids: ["ids", "ids"],
  deleteAll: true,
  namespace: "namespace",
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.fetch({
  ids: "ids",
  namespace: "namespace",
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
undefined;

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.list({
  prefix: "prefix",
  limit: 1,
  paginationToken: "paginationToken",
  namespace: "namespace",
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.query({
  topK: 1,
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.query({
  namespace: "namespace",
  topK: 1,
  includeValues: true,
  includeMetadata: true,
  queries: [
    {
      topK: 1,
      namespace: "namespace",
      indexedData: {
        indices: [1, 1],
        values: [1.1, 1.1],
      },
    },
    {
      topK: 1,
      namespace: "namespace",
      indexedData: {
        indices: [1, 1],
        values: [1.1, 1.1],
      },
    },
  ],
  column: [1.1, 1.1],
  id: "id",
  indexedData: {
    indices: [1, 1],
    values: [1.1, 1.1],
  },
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.update({
  id: "id",
});

```


```typescript
import { SeedApiClient } from "@fern/grpc-proto-exhaustive";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.dataservice.update({
  id: "id",
  values: [1.1, 1.1],
  namespace: "namespace",
  indexedData: {
    indices: [1, 1],
    values: [1.1, 1.1],
  },
});

```


