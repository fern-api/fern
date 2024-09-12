```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.headers.send({
  query: "What is the weather today",
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.headers.send({
  query: "What is the weather today",
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.inlined.send({
  query: "What is the weather today",
  temperature: 10.1,
  objectWithLiteral: {
    nestedLiteral: {},
  },
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.inlined.send({
  query: "What is the weather today",
  temperature: 10.1,
  objectWithLiteral: {
    nestedLiteral: {},
  },
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.path.send();
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.path.send();
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.query.send({
  query: "What is the weather today",
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.query.send({
  query: "string",
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.reference.send({
  query: "What is the weather today",
});
 
```                        


```typescript
import { SeedLiteralClient } from "@fern/literal";

const client = new SeedLiteralClient({ environment: "YOUR_BASE_URL" });
await client.reference.send({
  query: "What is the weather today",
});
 
```                        


