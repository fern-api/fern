```typescript
import { SeedApiClient } from "@fern/imdb";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.createMovie({
  title: "title",
  rating: 1.1,
});

```


```typescript
import { SeedApiClient } from "@fern/imdb";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("movieId");

```


