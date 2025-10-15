```typescript
import { SeedApiClient } from "@fern/custom";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.imdb.createMovie({
  title: "title",
  rating: 1.1,
});

```


```typescript
import { SeedApiClient } from "@fern/custom";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.imdb.getMovie("movieId");

```


```typescript
import { SeedApiClient } from "@fern/custom";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.imdb.getMovie("movieId");

```


```typescript
import { SeedApiClient } from "@fern/custom";

const client = new SeedApiClient({ environment: "YOUR_BASE_URL" });
await client.imdb.listMovies();

```


