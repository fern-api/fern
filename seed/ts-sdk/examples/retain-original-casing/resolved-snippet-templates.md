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
  prequel: "prequel",
  title: "title",
  from: "from",
  rating: 1.1,
  tag: "tag",
  book: "book",
  metadata: {
    metadata: { key: "value" },
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
		tag: "tag",
		X-API-Version: "X-API-Version"
	}
)

```


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({ environment: SeedExamplesEnvironment.Production, token: "YOUR_TOKEN" });        
await client.service.createBigEntity(
	{
		extendedMovie: {
				cast: [
					"cast",
					"cast"
				]
			},
		entity: {
				name: "name"
			},
		metadata: metadata: { 
				type : "html", 
				value: "metadata"
			},
		commonMetadata: {
				id: "id",
				data: {
					"data": "data"
				},
				jsonString: "jsonString"
			},
		eventInfo: eventInfo: { 
				type : "metadata", 
				id: "id",
				data: {
						"data": "data"
					},
				jsonString: "jsonString"
			},
		data: data: { 
				type : "string", 
				value: "data"
			},
		migration: {
				name: "name"
			},
		exception: exception: { 
				type : "generic", 
				exceptionType: "exceptionType",
				exceptionMessage: "exceptionMessage",
				exceptionStacktrace: "exceptionStacktrace"
			},
		test: test: { 
				type : "and", 
				value: true
			},
		node: {
				name: "name",
				nodes: [
					{
						name: "name"
					},
					{
						name: "name"
					}
				],
				trees: [
					
				]
			},
		directory: {
				name: "name",
				files: [
					{
						name: "name",
						contents: "contents"
					},
					{
						name: "name",
						contents: "contents"
					}
				],
				directories: [
					{
						name: "name"
					},
					{
						name: "name"
					}
				]
			},
		moment: {
				id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				date: "2023-01-15",
				datetime: "2024-01-15T09:30:00Z"
			}
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
await client.service.refreshToken({
  ttl: 420,
});

```


```typescript
import { SeedExamplesClient } from "@fern/examples";

const client = new SeedExamplesClient({
  environment: SeedExamplesEnvironment.Production,
  token: "YOUR_TOKEN",
});
await client.service.refreshToken({
  ttl: 1,
});

```


