```typescript
import { SeedApiClient } from "@fern/ts-express-casing";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.createMovie({
  id: "string",
  movieTitle: "string",
  movieRating: 1.1,
});
 
```                        


```typescript
import { SeedApiClient } from "@fern/ts-express-casing";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("string");
 
```                        


```typescript
import { SeedApiClient } from "@fern/ts-express-casing";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("string");
 
```                        


