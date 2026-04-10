# Reference
## _
<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">EchoAsync</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.EchoAsync("string");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">CreateTypeAsync</a>(OneOf&lt;BasicType, ComplexType&gt; { ... }) -> WithRawResponseTask&lt;Identifier&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.CreateTypeAsync(BasicType.Primitive);
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

**request:** `OneOf<BasicType, ComplexType>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.FileNotificationService.<a href="/src/SeedApi/FileNotificationService/FileNotificationServiceClient.cs">FileNotificationServiceGetExceptionAsync</a>(FileNotificationServiceGetExceptionRequest { ... }) -> WithRawResponseTask&lt;OneOf&lt;ExceptionZero, ExceptionType&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.FileNotificationService.FileNotificationServiceGetExceptionAsync(
    new FileNotificationServiceGetExceptionRequest { NotificationId = "notificationId" }
);
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

**request:** `FileNotificationServiceGetExceptionRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>client.FileService.<a href="/src/SeedApi/FileService/FileServiceClient.cs">FileServiceGetFileAsync</a>(FileServiceGetFileRequest { ... }) -> WithRawResponseTask&lt;File&gt;</code></summary>
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

```csharp
await client.FileService.FileServiceGetFileAsync(
    new FileServiceGetFileRequest { Filename = "filename" }
);
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

**request:** `FileServiceGetFileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>client.HealthService.<a href="/src/SeedApi/HealthService/HealthServiceClient.cs">HealthServiceCheckAsync</a>(HealthServiceCheckRequest { ... })</code></summary>
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

```csharp
await client.HealthService.HealthServiceCheckAsync(new HealthServiceCheckRequest { Id = "id" });
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

**request:** `HealthServiceCheckRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.HealthService.<a href="/src/SeedApi/HealthService/HealthServiceClient.cs">HealthServicePingAsync</a>() -> WithRawResponseTask&lt;bool&gt;</code></summary>
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

```csharp
await client.HealthService.HealthServicePingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">GetmovieAsync</a>(ServiceGetMovieRequest { ... }) -> WithRawResponseTask&lt;Movie&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetmovieAsync(new ServiceGetMovieRequest { MovieId = "movieId" });
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

**request:** `ServiceGetMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">CreatemovieAsync</a>(Movie { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreatemovieAsync(
    new Movie
    {
        Id = "id",
        Title = "title",
        From = "from",
        Rating = 1.1,
        Type = MovieType.Movie,
        Tag = "tag",
        Metadata = new Dictionary<string, object?>() { { "key", "value" } },
        Revenue = 1000000,
    }
);
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

**request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">GetmetadataAsync</a>(ServiceGetMetadataRequest { ... }) -> WithRawResponseTask&lt;Metadata&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetmetadataAsync(
    new ServiceGetMetadataRequest { ApiVersion = "X-API-Version" }
);
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

**request:** `ServiceGetMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">CreatebigentityAsync</a>(BigEntity { ... }) -> WithRawResponseTask&lt;Response&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreatebigentityAsync(new BigEntity());
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

**request:** `BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">RefreshtokenAsync</a>(RefreshTokenRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.RefreshtokenAsync(new RefreshTokenRequest { Ttl = 1 });
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

**request:** `RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

