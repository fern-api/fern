```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.listResources({
  page: 1,
  per_page: 1,
  sort: "created_at",
  order: "desc",
  include_totals: true,
  fields: "fields",
  search: "search",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.getResource("resourceId", {
  include_metadata: true,
  format: "json",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.searchResources({
  limit: 1,
  offset: 1,
  query: "query",
  filters: {
    filters: { key: "value" },
  },
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.listUsers({
  page: 1,
  per_page: 1,
  include_totals: true,
  sort: "sort",
  connection: "connection",
  q: "q",
  search_engine: "search_engine",
  fields: "fields",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.getUserById("userId", {
  fields: "fields",
  include_fields: true,
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.createUser({
  email: "email",
  email_verified: true,
  username: "username",
  password: "password",
  phone_number: "phone_number",
  phone_verified: true,
  user_metadata: {
    user_metadata: { key: "value" },
  },
  app_metadata: {
    app_metadata: { key: "value" },
  },
  connection: "connection",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.updateUser("userId", {
  email: "email",
  email_verified: true,
  username: "username",
  phone_number: "phone_number",
  phone_verified: true,
  user_metadata: {
    user_metadata: { key: "value" },
  },
  app_metadata: {
    app_metadata: { key: "value" },
  },
  password: "password",
  blocked: true,
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.deleteUser("userId");

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.listConnections({
  strategy: "strategy",
  name: "name",
  fields: "fields",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.getConnection("connectionId", {
  fields: "fields",
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.listClients({
  fields: "fields",
  include_fields: true,
  page: 1,
  per_page: 1,
  include_totals: true,
  is_global: true,
  is_first_party: true,
  app_type: ["app_type", "app_type"],
});

```


```typescript
import { SeedClientSideParamsClient } from "@fern/client-side-params";

const client = new SeedClientSideParamsClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.service.getClient("clientId", {
  fields: "fields",
  include_fields: true,
});

```


