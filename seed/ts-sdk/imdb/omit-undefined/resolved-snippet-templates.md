```typescript
import { SeedApiClient } from "@fern/imdb";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.createMovie({
  title: "string",
  rating: 1.1,
});
 
```                        


```typescript
import { SeedApiClient } from "@fern/imdb";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("string");
 
```                        


```typescript
import { SeedApiClient } from "@fern/imdb";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("string");
 
```                        


