# Reference
<details><summary><code>client.<a href="/src/Client.ts">echo</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.echo("Hello world!\\n\\nwith\\n\\tnewlines");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## 
## File Notification Service
<details><summary><code>client.file.notification.service.<a href="/src/api/resources/file/resources/notification/resources/service/client/Client.ts">getException</a>(notificationId) -> SeedExamples.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.file.notification.service.getException("notification-hsy129x");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**notificationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.file.service.<a href="/src/api/resources/file/resources/service/client/Client.ts">getFile</a>(filename, { ...params }) -> SeedExamples.File_</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.file.service.getFile("file.txt", {
    "X-File-API-Version": "0.0.2"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**filename:** `string` — This is a filename
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExamples.file.GetFileRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.health.service.<a href="/src/api/resources/health/resources/service/client/Client.ts">check</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.health.service.check("id-2sdx82h");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The id to check
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health.service.<a href="/src/api/resources/health/resources/service/client/Client.ts">ping</a>() -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.health.service.ping();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getMovie</a>(movieId) -> SeedExamples.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getMovie("movie-c06a4ad7");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**movieId:** `SeedExamples.MovieId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">createMovie</a>({ ...params }) -> SeedExamples.MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.createMovie({
    id: "movie-c06a4ad7",
    prequel: "movie-cv9b914f",
    title: "The Boy and the Heron",
    from: "Hayao Miyazaki",
    rating: 8,
    type: "movie",
    tag: "tag-wf9as23d",
    metadata: {
        "actors": [
            "Christian Bale",
            "Florence Pugh",
            "Willem Dafoe"
        ],
        "releaseDate": "2023-12-08",
        "ratings": {
            "rottenTomatoes": 97,
            "imdb": 7.6
        }
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExamples.Movie` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getMetadata</a>({ ...params }) -> SeedExamples.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getMetadata({
    "X-API-Version": "0.0.1",
    shallow: false,
    tag: "development"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExamples.GetMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getResponse</a>() -> SeedExamples.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getResponse();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
