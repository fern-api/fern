```typescript
import { SeedApiClient } from "@fern/ts-express-casing";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.createMovie({
  id: "id",
  movie_title: "movie_title",
  movie_rating: 1.1,
});

```


```typescript
import { SeedApiClient } from "@fern/ts-express-casing";

const client = new SeedApiClient({
  environment: "YOUR_BASE_URL",
  token: "YOUR_TOKEN",
});
await client.imdb.getMovie("movie_id");

```


