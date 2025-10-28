```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createUsername({
  tags: ["tags", "tags"],
  username: "username",
  password: "password",
  name: "test",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createUsernameWithReferencedType({
  tags: ["tags", "tags"],
  username: "username",
  password: "password",
  name: "test",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
undefined;

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createUsernameOptional({
  username: "username",
  password: "password",
  name: "test",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.getUsername({
  limit: 1,
  id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  date: "2023-01-15",
  deadline: "2024-01-15T09:30:00Z",
  bytes: "SGVsbG8gd29ybGQh",
  user: {
    name: "name",
    tags: ["tags", "tags"],
  },
  userList: [
    {
      name: "name",
    },
    {
      name: "name",
    },
  ],
  optionalDeadline: "2024-01-15T09:30:00Z",
  keyValue: {
    keyValue: "keyValue",
  },
  optionalString: "optionalString",
  nestedUser: {
    name: "name",
    user: {
      name: "name",
      tags: ["tags", "tags"],
    },
  },
  optionalUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  excludeUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  filter: "filter",
  longParam: 1000000,
  bigIntParam: "1000000",
});

```


