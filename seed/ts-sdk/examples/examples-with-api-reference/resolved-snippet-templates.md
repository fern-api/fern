```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.echo(
	{
		"Hello world!\\n\\nwith\\n\\tnewlines"
	}
)
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.echo(
	{
		"string"
	}
)
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
undefined;
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.file.notification.service.getException("notification-hsy129x");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.file.notification.service.getException("notificationId");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.file.service.getFile("file.txt");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.file.service.getFile("filename");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.check("id-2sdx82h");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.check("id-3tey93i");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.check("id");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.ping();
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.ping();
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getMovie("movie-c06a4ad7");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getMovie("movieId");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.createMovie({
  id: "movie-c06a4ad7",
  prequel: "movie-cv9b914f",
  title: "The Boy and the Heron",
  from: "Hayao Miyazaki",
  rating: 8,
  tag: "tag-wf9as23d",
  metadata: {
    actors: ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
    releaseDate: "2023-12-08",
    ratings: { rottenTomatoes: 97, imdb: 7.6 },
  },
  revenue: 1000000,
});
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.createMovie({
  id: "id",
  title: "title",
  from: "from",
  rating: 1.1,
  tag: "tag",
  metadata: {
    metadata: { key: "value" },
  },
  revenue: 1000000,
});
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getMetadata({
  shallow: false,
  tag: "development",
  xApiVersion: "0.0.1",
});
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getMetadata({
  xApiVersion: "X-API-Version",
});
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
undefined;
 
```                        


