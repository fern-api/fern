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
		"Hello world!\\n\\nwith\\n\\tnewlines"
	}
)
 
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
await client.file.notification.service.getException("string");
 
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
await client.file.service.getFile("string");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.file.service.getFile("string");
 
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
await client.health.service.check("string");
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.health.service.check("string");
 
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
await client.service.getMovie("movie-c06a4ad7");
 
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

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.service.getMetadata(
	{
		shallow: false,
		tag: "development",
		X-API-Version: "0.0.1"
	}
)
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.service.getMetadata(
	{
		shallow: true,
		tag: "string",
		X-API-Version: "string"
	}
)
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getResponse();
 
```                        


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.getResponse();
 
```                        


