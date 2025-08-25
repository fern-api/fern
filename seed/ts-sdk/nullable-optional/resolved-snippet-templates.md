```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.getUser("userId");

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.createUser({
  username: "username",
  email: "email",
  phone: "phone",
  address: {
    street: "street",
    city: "city",
    state: "state",
    zipCode: "zipCode",
    country: "country",
  },
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.updateUser("userId", {
  username: "username",
  email: "email",
  phone: "phone",
  address: {
    street: "street",
    city: "city",
    state: "state",
    zipCode: "zipCode",
    country: "country",
  },
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.listUsers({
  limit: 1,
  offset: 1,
  includeDeleted: true,
  sortBy: "sortBy",
});

```


```typescript
import { SeedNullableOptionalClient } from "@fern/nullable-optional";

const client = new SeedNullableOptionalClient({ environment: "YOUR_BASE_URL" });
await client.nullableOptional.searchUsers({
  query: "query",
  department: "department",
  role: "role",
  isActive: true,
});

```


