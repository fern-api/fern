```typescript
import { SeedIdempotencyHeadersClient } from "@fern/idempotency-headers";

const client = new SeedIdempotencyHeadersClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.payment.create({
  amount: 1,
});

```


```typescript
import { SeedIdempotencyHeadersClient } from "@fern/idempotency-headers";

const client = new SeedIdempotencyHeadersClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.payment.delete("paymentId");

```


