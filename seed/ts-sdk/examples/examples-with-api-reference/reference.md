# Reference
## 
<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">echo</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..echo("string");

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

**requestOptions:** `Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">createType</a>({ ...params }) -> SeedApi.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..createType("primitive");

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

**request:** `SeedApi.Type` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.fileNotificationService.<a href="/src/api/resources/fileNotificationService/client/Client.ts">fileNotificationServiceGetException</a>({ ...params }) -> SeedApi.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileNotificationService.fileNotificationServiceGetException({
    notificationId: "notificationId"
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

**request:** `SeedApi.FileNotificationServiceGetExceptionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FileNotificationServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>client.fileService.<a href="/src/api/resources/fileService/client/Client.ts">fileServiceGetFile</a>({ ...params }) -> SeedApi.File_</code></summary>
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
await client.fileService.fileServiceGetFile({
    filename: "filename"
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

**request:** `SeedApi.FileServiceGetFileRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FileServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>client.healthService.<a href="/src/api/resources/healthService/client/Client.ts">healthServiceCheck</a>({ ...params }) -> void</code></summary>
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
await client.healthService.healthServiceCheck({
    id: "id"
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

**request:** `SeedApi.HealthServiceCheckRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HealthServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.healthService.<a href="/src/api/resources/healthService/client/Client.ts">healthServicePing</a>() -> boolean</code></summary>
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
await client.healthService.healthServicePing();

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

**requestOptions:** `HealthServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getmovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getmovie({
    movieId: "movieId"
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

**request:** `SeedApi.ServiceGetMovieRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">createmovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.createmovie({
    id: "id",
    title: "title",
    from: "from",
    rating: 1.1,
    type: "movie",
    tag: "tag",
    metadata: {
        "key": "value"
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

**request:** `SeedApi.Movie` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">getmetadata</a>({ ...params }) -> SeedApi.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.getmetadata({
    "X-API-Version": "X-API-Version"
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

**request:** `SeedApi.ServiceGetMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">createbigentity</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.createbigentity();

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

**request:** `SeedApi.BigEntity` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">refreshtoken</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.refreshtoken({
    ttl: 1
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

**request:** `SeedApi.RefreshTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

