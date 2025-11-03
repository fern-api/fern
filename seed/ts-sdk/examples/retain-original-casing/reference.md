# Reference
<details><summary><code>client.<a href="/src/Client.ts">createType</a>({ ...params }) -> SeedExamples.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.createType("primitive");

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

**request:** `SeedExamples.Type` 
    
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
    },
    revenue: 1000000
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">createBigEntity</a>({ ...params }) -> SeedExamples.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.createBigEntity({
    castMember: {
        name: "name",
        id: "id"
    },
    extendedMovie: {
        cast: ["cast", "cast"],
        id: "id",
        prequel: "prequel",
        title: "title",
        from: "from",
        rating: 1.1,
        type: "movie",
        tag: "tag",
        book: "book",
        metadata: {
            "metadata": {
                "key": "value"
            }
        },
        revenue: 1000000
    },
    entity: {
        type: "primitive",
        name: "name"
    },
    metadata: {
        type: "html",
        extra: {
            "extra": "extra"
        },
        tags: ["tags"],
        value: "metadata"
    },
    commonMetadata: {
        id: "id",
        data: {
            "data": "data"
        },
        jsonString: "jsonString"
    },
    eventInfo: {
        type: "metadata",
        id: "id",
        data: {
            "data": "data"
        },
        jsonString: "jsonString"
    },
    data: {
        type: "string",
        value: "data"
    },
    migration: {
        name: "name",
        status: "RUNNING"
    },
    exception: {
        type: "generic",
        exceptionType: "exceptionType",
        exceptionMessage: "exceptionMessage",
        exceptionStacktrace: "exceptionStacktrace"
    },
    test: {
        type: "and",
        value: true
    },
    node: {
        name: "name",
        nodes: [{
                name: "name",
                nodes: [{
                        name: "name",
                        nodes: [],
                        trees: []
                    }, {
                        name: "name",
                        nodes: [],
                        trees: []
                    }],
                trees: [{
                        nodes: []
                    }, {
                        nodes: []
                    }]
            }, {
                name: "name",
                nodes: [{
                        name: "name",
                        nodes: [],
                        trees: []
                    }, {
                        name: "name",
                        nodes: [],
                        trees: []
                    }],
                trees: [{
                        nodes: []
                    }, {
                        nodes: []
                    }]
            }],
        trees: [{
                nodes: [{
                        name: "name",
                        nodes: [],
                        trees: []
                    }, {
                        name: "name",
                        nodes: [],
                        trees: []
                    }]
            }, {
                nodes: [{
                        name: "name",
                        nodes: [],
                        trees: []
                    }, {
                        name: "name",
                        nodes: [],
                        trees: []
                    }]
            }]
    },
    directory: {
        name: "name",
        files: [{
                name: "name",
                contents: "contents"
            }, {
                name: "name",
                contents: "contents"
            }],
        directories: [{
                name: "name",
                files: [{
                        name: "name",
                        contents: "contents"
                    }, {
                        name: "name",
                        contents: "contents"
                    }],
                directories: [{
                        name: "name",
                        files: [],
                        directories: []
                    }, {
                        name: "name",
                        files: [],
                        directories: []
                    }]
            }, {
                name: "name",
                files: [{
                        name: "name",
                        contents: "contents"
                    }, {
                        name: "name",
                        contents: "contents"
                    }],
                directories: [{
                        name: "name",
                        files: [],
                        directories: []
                    }, {
                        name: "name",
                        files: [],
                        directories: []
                    }]
            }]
    },
    moment: {
        id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        date: "2023-01-15",
        datetime: "2024-01-15T09:30:00Z"
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

**request:** `SeedExamples.BigEntity` 
    
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">refreshToken</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.refreshToken(undefined);

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

**request:** `SeedExamples.RefreshTokenRequest` 
    
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
