# Reference
<details><summary><code>client.<a href="/src/SeedExamples/SeedExamplesClient.cs">EchoAsync</a>(string { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
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

## File Notification Service
<details><summary><code>client.File.Notification.Service.<a href="/src/SeedExamples/File/Notification/Service/ServiceClient.cs">GetExceptionAsync</a>(notificationId) -> object</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.File.Notification.Service.GetExceptionAsync("notification-hsy129x");
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
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.File.Service.<a href="/src/SeedExamples/File/Service/ServiceClient.cs">GetFileAsync</a>(filename, GetFileRequest { ... }) -> File</code></summary>
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
await client.File.Service.GetFileAsync(
    "file.txt",
    new GetFileRequest { XFileApiVersion = "0.0.2" }
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

**filename:** `string` — This is a filename
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetFileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.Health.Service.<a href="/src/SeedExamples/Health/Service/ServiceClient.cs">CheckAsync</a>(id)</code></summary>
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
await client.Health.Service.CheckAsync("id-2sdx82h");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Health.Service.<a href="/src/SeedExamples/Health/Service/ServiceClient.cs">PingAsync</a>() -> bool</code></summary>
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
await client.Health.Service.PingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMovieAsync</a>(movieId) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetMovieAsync("movie-c06a4ad7");
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

**movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">CreateMovieAsync</a>(Movie { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreateMovieAsync(
    new Movie
    {
        Id = "movie-c06a4ad7",
        Prequel = "movie-cv9b914f",
        Title = "The Boy and the Heron",
        From = "Hayao Miyazaki",
        Rating = 8,
        Type = "movie",
        Tag = "tag-wf9as23d",
        Metadata = new Dictionary<string, object>()
        {
            {
                "actors",
                new List<object?>() { "Christian Bale", "Florence Pugh", "Willem Dafoe" }
            },
            { "releaseDate", "2023-12-08" },
            {
                "ratings",
                new Dictionary<object, object?>() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
            },
        },
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

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMetadataAsync</a>(GetMetadataRequest { ... }) -> object</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetMetadataAsync(
    new GetMetadataRequest
    {
        Shallow = false,
        Tag = ["development"],
        XApiVersion = "0.0.1",
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

**request:** `GetMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetResponseAsync</a>() -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetResponseAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
