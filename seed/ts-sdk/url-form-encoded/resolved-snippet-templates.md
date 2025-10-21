```typescript
import { SeedApiClient } from "@fern/url-form-encoded";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.submitFormData({
  username: "johndoe",
  email: "john@example.com",
});

```


```typescript
import { SeedApiClient } from "@fern/url-form-encoded";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.submitFormData({
  username: "username",
  email: "email",
});

```


